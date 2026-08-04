// lib/storage/product-image-storage.ts

const PRODUCT_IMAGE_PREFIX =
  "/storage/v1/object/public/product-images/";

const USER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_FILE_PATTERN =
  /^[^/]+\.(jpg|jpeg|png|webp)$/i;

/**
 * Normalizes a public image URL so it can be
 * compared reliably with another stored URL.
 */
function normalizeImageUrl(
  imageUrl: string
): string {
  const cleanUrl =
    imageUrl.trim();

  if (!cleanUrl) {
    return "";
  }

  try {
    const parsedUrl =
      new URL(cleanUrl);

    parsedUrl.hash = "";
    parsedUrl.search = "";

    return parsedUrl.toString();
  } catch {
    return cleanUrl;
  }
}

/**
 * Extracts the relative AthiMart Storage path from
 * an image's public URL.
 *
 * Example input:
 * https://example.com/storage/v1/object/public/product-images/
 * user-id/123456.jpg
 *
 * Example output:
 * user-id/123456.jpg
 *
 * For safety, only the existing product structure is accepted:
 *
 * authenticated-user-id/file.jpg
 *
 * Other folders such as seller-posts are ignored.
 */
export function extractProductImagePath(
  imageUrl: string
): string | null {
  const cleanUrl =
    imageUrl.trim();

  if (!cleanUrl) {
    return null;
  }

  try {
    const parsedUrl =
      new URL(cleanUrl);

    const prefixIndex =
      parsedUrl.pathname.indexOf(
        PRODUCT_IMAGE_PREFIX
      );

    if (prefixIndex < 0) {
      return null;
    }

    const encodedPath =
      parsedUrl.pathname.slice(
        prefixIndex +
          PRODUCT_IMAGE_PREFIX.length
      );

    const decodedPath =
      decodeURIComponent(
        encodedPath
      )
        .replace(/^\/+/, "")
        .replace(/\/+$/, "");

    const pathSegments =
      decodedPath.split("/");

    /*
     * Product images currently use:
     *
     * user-uuid/filename.jpg
     *
     * Ignore seller-posts and any unknown
     * nested folder structures.
     */
    if (
      pathSegments.length !== 2
    ) {
      return null;
    }

    const [
      ownerFolder,
      fileName,
    ] = pathSegments;

    if (
      !USER_ID_PATTERN.test(
        ownerFolder
      )
    ) {
      return null;
    }

    if (
      !ALLOWED_FILE_PATTERN.test(
        fileName
      )
    ) {
      return null;
    }

    return `${ownerFolder}/${fileName}`;
  } catch {
    return null;
  }
}

/**
 * Returns the AthiMart server paths that were removed
 * from the product while editing.
 */
export function getRemovedProductImagePaths(
  previousImageUrls: string[],
  nextImageUrls: string[]
): string[] {
  const nextUrlSet = new Set(
    nextImageUrls
      .map(normalizeImageUrl)
      .filter(Boolean)
  );

  const removedPaths =
    previousImageUrls
      .filter((imageUrl) => {
        const normalizedUrl =
          normalizeImageUrl(
            imageUrl
          );

        return (
          normalizedUrl.length >
            0 &&
          !nextUrlSet.has(
            normalizedUrl
          )
        );
      })
      .map(
        extractProductImagePath
      )
      .filter(
        (
          storagePath
        ): storagePath is string =>
          Boolean(storagePath)
      );

  return Array.from(
    new Set(removedPaths)
  );
}

/**
 * Returns every safely recognized product-image path.
 *
 * This will be used when a complete product is
 * permanently deleted.
 */
export function getProductImagePaths(
  imageUrls: string[]
): string[] {
  return Array.from(
    new Set(
      imageUrls
        .map(
          extractProductImagePath
        )
        .filter(
          (
            storagePath
          ): storagePath is string =>
            Boolean(storagePath)
        )
    )
  );
}