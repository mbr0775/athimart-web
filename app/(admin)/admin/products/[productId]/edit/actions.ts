// app/(admin)/admin/products/[productId]/edit/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { getRemovedProductImagePaths } from "@/lib/storage/product-image-storage";
import { createClient } from "@/lib/supabase/server";
import type { AdminProductFormState } from "@/types/admin-product-form";

interface ImageUrlResult {
  urls: string[];
  error: string;
}

interface AttributesResult {
  attributes: Record<
    string,
    unknown
  >;
  error: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Return a trimmed string from FormData.
 */
function getText(
  formData: FormData,
  name: string
): string {
  const value =
    formData.get(name);

  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

/**
 * Convert a FormData value to a number.
 *
 * Empty values return null.
 */
function getNumber(
  formData: FormData,
  name: string
): number | null {
  const value = getText(
    formData,
    name
  );

  if (!value) {
    return null;
  }

  const parsedValue = Number(
    value.replaceAll(",", "")
  );

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : null;
}

/**
 * Convert a name or custom value into
 * a URL-safe product slug.
 */
function slugify(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

/**
 * Parse the image URLs submitted by
 * ProductImageUploader.
 *
 * The uploader submits one URL per line.
 * The first URL is the primary image.
 */
function parseImageUrls(
  rawValue: string
): ImageUrlResult {
  if (!rawValue.trim()) {
    return {
      urls: [],
      error: "",
    };
  }

  const urls = Array.from(
    new Set(
      rawValue
        .split(/\r?\n/)
        .map((value) =>
          value.trim()
        )
        .filter(Boolean)
    )
  );

  if (urls.length > 6) {
    return {
      urls: [],
      error:
        "Add no more than six product images.",
    };
  }

  for (const imageUrl of urls) {
    try {
      const parsedUrl =
        new URL(imageUrl);

      if (
        parsedUrl.protocol !==
          "https:" &&
        parsedUrl.protocol !==
          "http:"
      ) {
        return {
          urls: [],
          error:
            "Every image must use an HTTP or HTTPS URL.",
        };
      }
    } catch {
      return {
        urls: [],
        error:
          `Invalid image URL: ${imageUrl}`,
      };
    }
  }

  return {
    urls,
    error: "",
  };
}

/**
 * Parse the JSON product specifications.
 */
function parseAttributes(
  rawValue: string
): AttributesResult {
  if (!rawValue.trim()) {
    return {
      attributes: {},
      error: "",
    };
  }

  try {
    const parsedValue: unknown =
      JSON.parse(rawValue);

    if (
      typeof parsedValue !==
        "object" ||
      parsedValue === null ||
      Array.isArray(
        parsedValue
      )
    ) {
      return {
        attributes: {},
        error:
          "Attributes must be a JSON object.",
      };
    }

    return {
      attributes:
        parsedValue as Record<
          string,
          unknown
        >,
      error: "",
    };
  } catch {
    return {
      attributes: {},
      error:
        "Attributes contain invalid JSON.",
    };
  }
}

/**
 * Update one AthiMart product.
 *
 * Processing order:
 *
 * 1. Confirm the current user is an admin.
 * 2. Validate all submitted product data.
 * 3. Read the existing product image URLs.
 * 4. Update the AthiMart database.
 * 5. Remove images no longer used by the product.
 * 6. Revalidate product pages and redirect.
 */
export async function updateProduct(
  productId: string,
  previousState: AdminProductFormState,
  formData: FormData
): Promise<AdminProductFormState> {
  void previousState;

  await getCurrentAdmin();

  const cleanedProductId =
    productId.trim();

  if (
    !UUID_PATTERN.test(
      cleanedProductId
    )
  ) {
    return {
      message:
        "The selected product is invalid.",
      fieldErrors: {
        form:
          "A valid product ID was not provided.",
      },
    };
  }

  const name = getText(
    formData,
    "name"
  );

  const customSlug =
    getText(
      formData,
      "slug"
    );

  const companyName =
    getText(
      formData,
      "companyName"
    );

  const brand = getText(
    formData,
    "brand"
  );

  const model = getText(
    formData,
    "model"
  );

  const sku = getText(
    formData,
    "sku"
  );

  const category = getText(
    formData,
    "category"
  );

  const subCategory =
    getText(
      formData,
      "subCategory"
    );

  const description =
    getText(
      formData,
      "description"
    );

  const seoTitle = getText(
    formData,
    "seoTitle"
  );

  const seoDescription =
    getText(
      formData,
      "seoDescription"
    );

  const emoji =
    getText(
      formData,
      "emoji"
    ) || "📦";

  const priceLkr =
    getNumber(
      formData,
      "priceLkr"
    );

  const originalPriceLkr =
    getNumber(
      formData,
      "originalPriceLkr"
    );

  const stock = getNumber(
    formData,
    "stock"
  );

  const isActive =
    formData.get(
      "isActive"
    ) === "on";

  const isFeatured =
    formData.get(
      "isFeatured"
    ) === "on";

  const imageResult =
    parseImageUrls(
      getText(
        formData,
        "imageUrls"
      )
    );

  const attributesResult =
    parseAttributes(
      getText(
        formData,
        "attributes"
      )
    );

  const fieldErrors: Record<
    string,
    string
  > = {};

  if (name.length < 2) {
    fieldErrors.name =
      "Enter a product name.";
  }

  if (
    companyName.length < 2
  ) {
    fieldErrors.companyName =
      "Enter the company or seller name.";
  }

  if (!category) {
    fieldErrors.category =
      "Select a category.";
  }

  if (!subCategory) {
    fieldErrors.subCategory =
      "Select a product type.";
  }

  /*
   * Existing products may have short
   * descriptions. Only an empty value
   * blocks the update.
   */
  if (!description) {
    fieldErrors.description =
      "Enter a product description.";
  }

  if (
    priceLkr === null ||
    priceLkr < 0
  ) {
    fieldErrors.priceLkr =
      "Enter a valid Sri Lankan price.";
  }

  if (
    originalPriceLkr !==
      null &&
    originalPriceLkr < 0
  ) {
    fieldErrors.originalPriceLkr =
      "Enter a valid original price.";
  }

  if (
    stock === null ||
    stock < 0 ||
    !Number.isInteger(stock)
  ) {
    fieldErrors.stock =
      "Stock must be a whole number of zero or more.";
  }

  if (
    seoTitle.length > 70
  ) {
    fieldErrors.seoTitle =
      "Keep the SEO title within 70 characters.";
  }

  if (
    seoDescription.length >
    160
  ) {
    fieldErrors.seoDescription =
      "Keep the SEO description within 160 characters.";
  }

  if (imageResult.error) {
    fieldErrors.imageUrls =
      imageResult.error;
  }

  if (
    attributesResult.error
  ) {
    fieldErrors.attributes =
      attributesResult.error;
  }

  const slug = slugify(
    customSlug || name
  );

  if (!slug) {
    fieldErrors.slug =
      "Enter a valid product URL slug.";
  }

  if (
    Object.keys(
      fieldErrors
    ).length > 0
  ) {
    return {
      message:
        "Correct the highlighted product fields.",
      fieldErrors,
    };
  }

  const currentPrice =
    priceLkr as number;

  /*
   * If the original price is missing or
   * lower than the selling price, use the
   * selling price as the original price.
   */
  const resolvedOriginalPrice =
    originalPriceLkr !== null &&
    originalPriceLkr >
      currentPrice
      ? originalPriceLkr
      : currentPrice;

  const discountPercent =
    resolvedOriginalPrice >
    currentPrice
      ? Math.round(
          ((resolvedOriginalPrice -
            currentPrice) /
            resolvedOriginalPrice) *
            100
        )
      : 0;

  const athimartClient =
    await createClient();

  /*
   * Read the existing product and its
   * current image URLs before updating.
   */
  const {
    data: currentProduct,
    error:
      currentProductError,
  } = await athimartClient
    .from("products")
    .select(
      "id, image_urls"
    )
    .eq(
      "id",
      cleanedProductId
    )
    .maybeSingle();

  if (currentProductError) {
    return {
      message:
        "The product could not be verified.",
      fieldErrors: {
        form:
          currentProductError.message,
      },
    };
  }

  if (!currentProduct) {
    return {
      message:
        "The selected product no longer exists.",
      fieldErrors: {
        form:
          "Return to the product list and select another product.",
      },
    };
  }

  const previousImageUrls =
    Array.isArray(
      currentProduct.image_urls
    )
      ? currentProduct.image_urls.filter(
          (
            imageUrl
          ): imageUrl is string =>
            typeof imageUrl ===
              "string" &&
            imageUrl.trim().length >
              0
        )
      : [];

  /*
   * Prevent another product from using
   * the same public URL slug.
   */
  const {
    data: existingSlug,
    error: slugLookupError,
  } = await athimartClient
    .from("products")
    .select("id")
    .eq("slug", slug)
    .neq(
      "id",
      cleanedProductId
    )
    .maybeSingle();

  if (slugLookupError) {
    return {
      message:
        "The product URL could not be checked.",
      fieldErrors: {
        slug:
          slugLookupError.message,
      },
    };
  }

  if (existingSlug) {
    return {
      message:
        "Another product already uses this URL slug.",
      fieldErrors: {
        slug:
          "Enter another slug or change the product name.",
      },
    };
  }

  /*
   * Save the updated product information
   * in the AthiMart database.
   */
  const {
    data: updatedProduct,
    error: updateError,
  } = await athimartClient
    .from("products")
    .update({
      slug,
      name,

      company_name:
        companyName,

      brand:
        brand || null,

      model:
        model || null,

      sku:
        sku || null,

      category,

      sub_category:
        subCategory,

      description,

      seo_title:
        seoTitle || null,

      seo_description:
        seoDescription ||
        null,

      emoji,

      price:
        currentPrice,

      price_lkr:
        currentPrice,

      original_price:
        resolvedOriginalPrice,

      original_price_lkr:
        resolvedOriginalPrice,

      stock:
        stock as number,

      discount_percent:
        discountPercent,

      is_active:
        isActive,

      is_featured:
        isFeatured,

      image_urls:
        imageResult.urls,

      attributes:
        attributesResult.attributes,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      cleanedProductId
    )
    .select(
      "id, slug"
    )
    .maybeSingle();

  if (updateError) {
    return {
      message:
        "The product could not be updated.",
      fieldErrors: {
        form:
          updateError.message,
      },
    };
  }

  if (!updatedProduct) {
    return {
      message:
        "No product was updated.",
      fieldErrors: {
        form:
          "The AthiMart database rejected the update. Check the admin product update policy.",
      },
    };
  }

  /*
   * The AthiMart database update has now
   * succeeded.
   *
   * Compare the previous and new image lists
   * and remove only files no longer used by
   * this product.
   */
  const removedImagePaths =
    getRemovedProductImagePaths(
      previousImageUrls,
      imageResult.urls
    );

  if (
    removedImagePaths.length >
    0
  ) {
    const {
      error:
        imageRemovalError,
    } = await athimartClient.storage
      .from(
        "product-images"
      )
      .remove(
        removedImagePaths
      );

    /*
     * Image cleanup should not reverse an
     * otherwise successful product update.
     *
     * A temporary cleanup failure is logged
     * on the AthiMart server for review.
     */
    if (imageRemovalError) {
      console.error(
        "AthiMart product image cleanup failed:",
        imageRemovalError.message
      );
    }
  }

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    `/admin/products/${cleanedProductId}/edit`
  );

  revalidatePath("/shop");

  revalidatePath(
    "/",
    "layout"
  );

  redirect(
    "/admin/products?updated=1"
  );
}