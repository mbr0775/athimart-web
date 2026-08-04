"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Upload,
} from "lucide-react";

import {
  saveDeliveryPartnerDocumentPath,
  type DeliveryPartnerDocumentSlot,
} from "@/app/(store)/delivery-partner/register/document-actions";
import { createClient } from "@/lib/supabase/client";

export type DeliveryPartnerDocumentCategory =
  | "profile-photo"
  | "identity"
  | "driving-licence"
  | "police-clearance"
  | "vehicle-photos"
  | "vehicle-registration"
  | "vehicle-ownership"
  | "vehicle-insurance"
  | "vehicle-revenue-licence"
  | "vehicle-emission"
  | "other-supporting-document";

interface DocumentUploadFieldProps {
  name: string;

  category: DeliveryPartnerDocumentCategory;
  documentSlot: DeliveryPartnerDocumentSlot;

  label: string;
  description: string;

  vehicleId?: string | null;
  existingPath?: string | null;

  required?: boolean;
  disabled?: boolean;

  onUploadComplete?: (
    storagePath: string
  ) => void;
}

const STORAGE_BUCKET =
  "delivery-partner-documents";

const MAXIMUM_FILE_SIZE_BYTES =
  6 * 1024 * 1024;

const ALLOWED_MIME_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ]);

const FILE_EXTENSIONS: Record<
  string,
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

function formatFileSize(
  bytes: number
): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getDisplayFileName(
  storagePath: string
): string {
  const pathParts =
    storagePath.split("/");

  return (
    pathParts.at(-1) ??
    "Uploaded document"
  );
}

function getSafeUploadMessage(
  message: string
): string {
  const normalizedMessage =
    message.toLowerCase();

  if (
    normalizedMessage.includes(
      "row-level security"
    ) ||
    normalizedMessage.includes(
      "not authorized"
    ) ||
    normalizedMessage.includes(
      "unauthorized"
    )
  ) {
    return "You do not currently have permission to upload this document.";
  }

  if (
    normalizedMessage.includes(
      "maximum allowed size"
    ) ||
    normalizedMessage.includes(
      "payload too large"
    )
  ) {
    return "The selected file is larger than the permitted upload size.";
  }

  if (
    normalizedMessage.includes(
      "mime type"
    ) ||
    normalizedMessage.includes(
      "content type"
    )
  ) {
    return "This file type is not permitted.";
  }

  return "The document could not be uploaded. Please try again.";
}

export default function DocumentUploadField({
  name,
  category,
  documentSlot,
  label,
  description,
  vehicleId = null,
  existingPath = null,
  required = false,
  disabled = false,
  onUploadComplete,
}: Readonly<DocumentUploadFieldProps>) {
  const [
    uploadedPath,
    setUploadedPath,
  ] = useState(
    existingPath ?? ""
  );

  const [
    uploadedFileName,
    setUploadedFileName,
  ] = useState(
    existingPath
      ? getDisplayFileName(
          existingPath
        )
      : ""
  );

  const [
    uploadedFileSize,
    setUploadedFileSize,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  async function removeUnlinkedFile(
    storagePath: string
  ) {
    try {
      const supabase =
        createClient();

      const {
        error,
      } =
        await supabase.storage
          .from(
            STORAGE_BUCKET
          )
          .remove([
            storagePath,
          ]);

      if (error) {
        console.error(
          "Removing unlinked delivery-partner document failed:",
          {
            storagePath,
            message:
              error.message,
          }
        );
      }
    } catch (error) {
      console.error(
        "Unexpected error while removing an unlinked document:",
        error
      );
    }
  }

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const input =
      event.currentTarget;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");

    if (
      !ALLOWED_MIME_TYPES.has(
        file.type
      )
    ) {
      setErrorMessage(
        "Select a JPG, PNG, WebP or PDF file."
      );

      input.value = "";
      return;
    }

    if (
      file.size >
      MAXIMUM_FILE_SIZE_BYTES
    ) {
      setErrorMessage(
        "The selected file must not exceed 6 MB."
      );

      input.value = "";
      return;
    }

    const extension =
      FILE_EXTENSIONS[
        file.type
      ];

    if (!extension) {
      setErrorMessage(
        "The selected file type is not supported."
      );

      input.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const supabase =
        createClient();

      /*
       * Confirm the authenticated user before
       * constructing the private object path.
       */
      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        window.location.assign(
          `/auth/login?next=${encodeURIComponent(
            "/delivery-partner/register"
          )}`
        );

        return;
      }

      /*
       * Required private Storage path:
       *
       * <user-id>/<category>/<unique-file-name>
       */
      const objectPath =
        [
          user.id,
          category,
          `${Date.now()}-${crypto.randomUUID()}.${extension}`,
        ].join("/");

      /*
       * Upload the document using the authenticated
       * browser session and Storage RLS policies.
       */
      const {
        data: uploadData,
        error: uploadError,
      } =
        await supabase.storage
          .from(
            STORAGE_BUCKET
          )
          .upload(
            objectPath,
            file,
            {
              cacheControl:
                "3600",

              contentType:
                file.type,

              /*
               * Never silently overwrite an
               * existing private object.
               */
              upsert:
                false,
            }
          );

      if (uploadError) {
        console.error(
          "Delivery-partner document upload failed:",
          {
            category,
            documentSlot,

            fileName:
              file.name,

            fileSize:
              file.size,

            fileType:
              file.type,

            code:
              uploadError.name,

            message:
              uploadError.message,
          }
        );

        setErrorMessage(
          getSafeUploadMessage(
            uploadError.message
          )
        );

        return;
      }

      const storagePath =
        uploadData.path.trim();

      if (!storagePath) {
        setErrorMessage(
          "The upload completed without returning a valid document path."
        );

        return;
      }

      /*
       * Link the verified Storage object to the
       * appropriate profile or vehicle field.
       */
      const linkResult =
        await saveDeliveryPartnerDocumentPath(
          {
            documentSlot,
            storagePath,
            vehicleId,
          }
        );

      if (!linkResult.success) {
        /*
         * Avoid leaving an unlinked private object
         * when the database operation fails.
         */
        await removeUnlinkedFile(
          storagePath
        );

        if (
          linkResult.code ===
          "UNAUTHENTICATED"
        ) {
          window.location.assign(
            `/auth/login?next=${encodeURIComponent(
              "/delivery-partner/register"
            )}`
          );

          return;
        }

        setErrorMessage(
          linkResult.message
        );

        return;
      }

      setUploadedPath(
        linkResult.document
          .storagePath
      );

      setUploadedFileName(
        file.name
      );

      setUploadedFileSize(
        formatFileSize(
          file.size
        )
      );

      onUploadComplete?.(
        linkResult.document
          .storagePath
      );
    } catch (error) {
      console.error(
        "Unexpected delivery-partner document upload error:",
        error
      );

      setErrorMessage(
        "An unexpected error occurred while uploading the document."
      );
    } finally {
      setIsUploading(false);

      /*
       * Allow the same local file to be
       * selected again when needed.
       */
      input.value = "";
    }
  }

  return (
    <div className="border border-[var(--border)] bg-white p-5">
      {/*
       * Keeps the verified private Storage path
       * available to a surrounding form when needed.
       */}
      <input
        type="hidden"
        name={name}
        value={uploadedPath}
      />

      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]">
          <FileText
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={`${name}-file`}
              className="font-[var(--font-body)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text)]"
            >
              {label}

              {required && (
                <span className="ml-1 text-[var(--sale)]">
                  *
                </span>
              )}
            </label>

            <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--success)]">
              <LockKeyhole
                aria-hidden="true"
                className="h-3.5 w-3.5"
                strokeWidth={1.8}
              />

              Private
            </span>
          </div>

          <p className="mt-2 font-[var(--font-body)] text-xs leading-6 text-[var(--text-muted)]">
            {description}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-5 flex items-start gap-3 border-l-4 border-[var(--sale)] bg-red-50 p-4 text-[var(--sale)]"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0"
            strokeWidth={1.8}
          />

          <p className="font-[var(--font-body)] text-xs leading-6">
            {errorMessage}
          </p>
        </div>
      )}

      {uploadedPath && (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 flex items-start gap-3 border-l-4 border-[var(--success)] bg-green-50 p-4"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
            strokeWidth={1.8}
          />

          <div className="min-w-0">
            <p className="font-[var(--font-body)] text-xs font-semibold text-[var(--success)]">
              Document uploaded and linked securely
            </p>

            <p className="mt-1 break-all font-[var(--font-body)] text-[10px] leading-5 text-[var(--text-muted)]">
              {uploadedFileName}

              {uploadedFileSize
                ? ` • ${uploadedFileSize}`
                : ""}
            </p>
          </div>
        </div>
      )}

      <label
        htmlFor={`${name}-file`}
        className={`mt-5 flex min-h-12 w-full items-center justify-center gap-3 border px-5 text-center font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
          disabled ||
          isUploading
            ? "cursor-not-allowed border-neutral-300 bg-neutral-200 text-neutral-500"
            : "cursor-pointer border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white hover:bg-[var(--brand-blue-dark)]"
        }`}
      >
        {isUploading ? (
          <LoaderCircle
            aria-hidden="true"
            className="h-5 w-5 animate-spin"
            strokeWidth={1.8}
          />
        ) : (
          <Upload
            aria-hidden="true"
            className="h-5 w-5"
            strokeWidth={1.8}
          />
        )}

        {isUploading
          ? "Uploading and Linking..."
          : uploadedPath
            ? "Upload Replacement"
            : "Choose and Upload File"}
      </label>

      <input
        id={`${name}-file`}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        required={
          required &&
          !uploadedPath
        }
        disabled={
          disabled ||
          isUploading
        }
        onChange={
          handleFileChange
        }
        className="sr-only"
      />

      <p className="mt-3 text-center font-[var(--font-body)] text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
        JPG, PNG, WebP or PDF • Maximum 6 MB
      </p>
    </div>
  );
}