// components/admin/product-image-uploader.tsx

"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import {
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

interface ProductImageUploaderProps {
  initialUrls?: string[];
  maximumImages?: number;
}

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const maximumFileSize =
  5 * 1024 * 1024;

function getUniqueUrls(
  imageUrls: string[],
  maximumImages: number
): string[] {
  return Array.from(
    new Set(
      imageUrls
        .map((imageUrl) =>
          imageUrl.trim()
        )
        .filter(Boolean)
    )
  ).slice(0, maximumImages);
}

function getFileExtension(
  file: File
): string {
  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "png" ||
    extension === "webp"
  ) {
    return extension === "jpeg"
      ? "jpg"
      : extension;
  }

  switch (file.type) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return "jpg";
  }
}

function formatFileSize(
  bytes: number
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes =
    bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(
      0
    )} KB`;
  }

  const megabytes =
    kilobytes / 1024;

  return `${megabytes.toFixed(
    1
  )} MB`;
}

export function ProductImageUploader({
  initialUrls = [],
  maximumImages = 6,
}: Readonly<ProductImageUploaderProps>) {
  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [imageUrls, setImageUrls] =
    useState<string[]>(() =>
      getUniqueUrls(
        initialUrls,
        maximumImages
      )
    );

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState("");

  const [error, setError] =
    useState("");

  const availableSlots =
    Math.max(
      maximumImages -
        imageUrls.length,
      0
    );

  function openFilePicker() {
    if (
      uploading ||
      availableSlots <= 0
    ) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function uploadImages(
    files: File[]
  ) {
    setError("");
    setUploadProgress("");

    if (files.length === 0) {
      return;
    }

    if (availableSlots <= 0) {
      setError(
        `You can upload a maximum of ${maximumImages} images.`
      );

      return;
    }

    if (
      files.length >
      availableSlots
    ) {
      setError(
        `Only ${availableSlots} more ${
          availableSlots === 1
            ? "image"
            : "images"
        } can be added.`
      );

      return;
    }

    for (const file of files) {
      if (
        !allowedImageTypes.has(
          file.type
        )
      ) {
        setError(
          `${file.name} is not supported. Select JPG, PNG or WebP images.`
        );

        return;
      }

      if (
        file.size >
        maximumFileSize
      ) {
        setError(
          `${file.name} is ${formatFileSize(
            file.size
          )}. Each image must be 5 MB or smaller.`
        );

        return;
      }

      if (file.size <= 0) {
        setError(
          `${file.name} is empty and cannot be uploaded.`
        );

        return;
      }
    }

    setUploading(true);

    const uploadedUrls: string[] =
      [];

    try {
      const athimartClient =
        createClient();

      const {
        data: userData,
        error: userError,
      } =
        await athimartClient.auth.getUser();

      if (
        userError ||
        !userData.user
      ) {
        throw new Error(
          "Your AthiMart session has expired. Sign in again before uploading images."
        );
      }

      const baseTimestamp =
        Date.now();

      for (
        let index = 0;
        index < files.length;
        index += 1
      ) {
        const file =
          files[index];

        setUploadProgress(
          `Uploading image ${
            index + 1
          } of ${files.length}...`
        );

        const extension =
          getFileExtension(
            file
          );

        /*
         * Matches the AthiMart mobile
         * application image structure:
         *
         * authenticated-user-id/timestamp.jpg
         */
        const timestamp =
          baseTimestamp +
          index;

        const storagePath =
          `${userData.user.id}/${timestamp}.${extension}`;

        const {
          error: uploadError,
        } =
          await athimartClient.storage
            .from(
              "product-images"
            )
            .upload(
              storagePath,
              file,
              {
                cacheControl:
                  "3600",

                contentType:
                  file.type,

                upsert: false,
              }
            );

        if (uploadError) {
          throw new Error(
            `Unable to upload ${file.name}: ${uploadError.message}`
          );
        }

        const {
          data:
            publicUrlData,
        } =
          athimartClient.storage
            .from(
              "product-images"
            )
            .getPublicUrl(
              storagePath
            );

        if (
          !publicUrlData.publicUrl
        ) {
          throw new Error(
            `A public image URL could not be created for ${file.name}.`
          );
        }

        uploadedUrls.push(
          publicUrlData.publicUrl
        );
      }

      setImageUrls(
        (currentUrls) =>
          getUniqueUrls(
            [
              ...currentUrls,
              ...uploadedUrls,
            ],
            maximumImages
          )
      );

      setUploadProgress(
        files.length === 1
          ? "Image uploaded successfully."
          : `${files.length} images uploaded successfully.`
      );
    } catch (uploadError) {
      /*
       * Keep URLs for files that were
       * successfully uploaded before
       * another file failed.
       */
      if (
        uploadedUrls.length >
        0
      ) {
        setImageUrls(
          (currentUrls) =>
            getUniqueUrls(
              [
                ...currentUrls,
                ...uploadedUrls,
              ],
              maximumImages
            )
        );
      }

      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "The images could not be uploaded to the AthiMart server."
      );

      setUploadProgress("");
    } finally {
      setUploading(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  function removeImage(
    imageIndex: number
  ) {
    if (uploading) {
      return;
    }

    setImageUrls(
      (currentUrls) =>
        currentUrls.filter(
          (
            _imageUrl,
            currentIndex
          ) =>
            currentIndex !==
            imageIndex
        )
    );

    setError("");
    setUploadProgress("");
  }

  function makePrimary(
    imageIndex: number
  ) {
    if (
      uploading ||
      imageIndex === 0
    ) {
      return;
    }

    setImageUrls(
      (currentUrls) => {
        const nextUrls = [
          ...currentUrls,
        ];

        const selectedImage =
          nextUrls[
            imageIndex
          ];

        if (!selectedImage) {
          return currentUrls;
        }

        nextUrls.splice(
          imageIndex,
          1
        );

        nextUrls.unshift(
          selectedImage
        );

        return nextUrls;
      }
    );

    setError("");
    setUploadProgress("");
  }

  function moveImage(
    imageIndex: number,
    direction:
      | "left"
      | "right"
  ) {
    if (uploading) {
      return;
    }

    setImageUrls(
      (currentUrls) => {
        const destinationIndex =
          direction === "left"
            ? imageIndex - 1
            : imageIndex + 1;

        if (
          destinationIndex < 0 ||
          destinationIndex >=
            currentUrls.length
        ) {
          return currentUrls;
        }

        const nextUrls = [
          ...currentUrls,
        ];

        [
          nextUrls[imageIndex],
          nextUrls[
            destinationIndex
          ],
        ] = [
          nextUrls[
            destinationIndex
          ],
          nextUrls[imageIndex],
        ];

        return nextUrls;
      }
    );

    setError("");
    setUploadProgress("");
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={uploading}
        aria-label="Select product images"
        className="sr-only"
        onChange={(event) => {
          const files =
            Array.from(
              event.target.files ??
                []
            );

          void uploadImages(
            files
          );
        }}
      />

      {/*
       * This is the only imageUrls field
       * submitted with the parent form.
       *
       * The first line is treated as the
       * primary product image.
       */}
      <input
        type="hidden"
        name="imageUrls"
        value={imageUrls.join(
          "\n"
        )}
      />

      {/* Upload control */}
      <button
        type="button"
        disabled={
          uploading ||
          availableSlots <= 0
        }
        onClick={
          openFilePicker
        }
        className="flex min-h-36 w-full flex-col items-center justify-center border-2 border-dashed border-[var(--border-strong)] bg-[var(--linen-light)] px-5 py-6 text-center transition-colors hover:border-[var(--brand-blue)] hover:bg-[var(--brand-blue-soft)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <LoaderCircle
            aria-hidden="true"
            className="h-8 w-8 animate-spin text-[var(--brand-blue)]"
            strokeWidth={1.7}
          />
        ) : (
          <UploadCloud
            aria-hidden="true"
            className="h-8 w-8 text-[var(--brand-blue)]"
            strokeWidth={1.7}
          />
        )}

        <span className="mt-3 font-[var(--font-body)] text-sm font-semibold text-[var(--brand-blue-dark)]">
          {uploading
            ? uploadProgress ||
              "Uploading images..."
            : availableSlots <=
                0
              ? "Maximum images reached"
              : "Select product images"}
        </span>

        <span className="mt-2 font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
          JPG, PNG or WebP · Maximum
          5 MB each
        </span>

        <span className="mt-1 font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-orange-dark)]">
          {imageUrls.length} of{" "}
          {maximumImages} images used
        </span>
      </button>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 border-l-4 border-[var(--sale)] bg-red-50 px-4 py-3"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sale)]"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-xs leading-5 text-[var(--sale)]">
            {error}
          </p>
        </div>
      )}

      {/* Upload success */}
      {!error &&
        uploadProgress &&
        !uploading && (
          <div
            role="status"
            className="mt-4 border-l-4 border-[var(--success)] bg-green-50 px-4 py-3"
          >
            <p className="font-[var(--font-body)] text-xs font-semibold leading-5 text-[var(--success)]">
              {uploadProgress}
            </p>
          </div>
        )}

      {/* Ordering reminder */}
      {imageUrls.length > 0 && (
        <div className="mt-5 flex items-start gap-3 border-l-4 border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-4 py-3">
          <Star
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-blue)]"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-xs leading-5 text-[var(--text-soft)]">
            Image number 1 is the
            primary image. Use the
            arrows to change the image
            order or select Make
            Primary.
          </p>
        </div>
      )}

      {/* Image cards */}
      {imageUrls.length > 0 ? (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {imageUrls.map(
            (
              imageUrl,
              imageIndex
            ) => {
              const isPrimary =
                imageIndex === 0;

              const canMoveLeft =
                imageIndex > 0;

              const canMoveRight =
                imageIndex <
                imageUrls.length -
                  1;

              return (
                <article
                  key={imageUrl}
                  className={`border bg-white p-3 ${
                    isPrimary
                      ? "border-[var(--brand-blue)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-[var(--linen-light)]">
                    <Image
                      src={imageUrl}
                      alt={
                        isPrimary
                          ? "Primary product image"
                          : `Product image ${
                              imageIndex +
                              1
                            }`
                      }
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-contain p-3"
                    />

                    {/* Image number */}
                    <span className="absolute left-2 top-2 flex h-8 min-w-8 items-center justify-center bg-white px-2 font-[var(--font-body)] text-[10px] font-bold text-[var(--brand-blue-dark)] shadow">
                      {imageIndex + 1}
                    </span>

                    {/* Primary badge */}
                    {isPrimary && (
                      <span className="absolute right-2 top-2 inline-flex min-h-8 items-center gap-1.5 bg-[var(--brand-blue)] px-3 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.12em] text-white! shadow">
                        <Star
                          aria-hidden="true"
                          className="h-3.5 w-3.5 fill-current text-white!"
                          strokeWidth={1.8}
                        />

                        <span className="text-white!">
                          Primary
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Ordering controls */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={
                        uploading ||
                        !canMoveLeft
                      }
                      onClick={() =>
                        moveImage(
                          imageIndex,
                          "left"
                        )
                      }
                      aria-label={`Move product image ${
                        imageIndex + 1
                      } left`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--border)] bg-white px-3 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowLeft
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />

                      <span>
                        Left
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={
                        uploading ||
                        !canMoveRight
                      }
                      onClick={() =>
                        moveImage(
                          imageIndex,
                          "right"
                        )
                      }
                      aria-label={`Move product image ${
                        imageIndex + 1
                      } right`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--border)] bg-white px-3 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)] transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <span>
                        Right
                      </span>

                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>

                  {/* Primary and remove controls */}
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={
                        uploading ||
                        isPrimary
                      }
                      onClick={() =>
                        makePrimary(
                          imageIndex
                        )
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--brand-blue)] bg-[var(--brand-blue-soft)] px-3 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-blue)] transition-colors hover:bg-[var(--brand-blue)] hover:text-white! disabled:cursor-default disabled:border-[var(--success)] disabled:bg-green-50 disabled:text-[var(--success)] disabled:opacity-100"
                    >
                      <Star
                        aria-hidden="true"
                        className={`h-4 w-4 ${
                          isPrimary
                            ? "fill-current"
                            : ""
                        }`}
                        strokeWidth={1.8}
                      />

                      <span>
                        {isPrimary
                          ? "Primary Image"
                          : "Make Primary"}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() =>
                        removeImage(
                          imageIndex
                        )
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 border border-[var(--sale)] bg-red-50 px-3 font-[var(--font-body)] text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--sale)] transition-colors hover:bg-[var(--sale)] hover:text-white! disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2
                        aria-hidden="true"
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />

                      <span>
                        Remove
                      </span>
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-3 border border-[var(--border)] bg-white p-4">
          <ImagePlus
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-orange-dark)]"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-xs leading-5 text-[var(--text-muted)]">
            No product images have
            been selected. Upload at
            least one image before
            adding the product.
          </p>
        </div>
      )}
    </div>
  );
}