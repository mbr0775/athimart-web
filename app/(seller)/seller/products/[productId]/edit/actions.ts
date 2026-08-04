// app/(seller)/seller/products/[productId]/edit/actions.ts

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentSeller } from "@/lib/auth/seller";
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
 * Empty values return null.
 */
function getNumber(
  formData: FormData,
  name: string
): number | null {
  const value =
    getText(
      formData,
      name
    );

  if (!value) {
    return null;
  }

  const parsedValue =
    Number(
      value.replaceAll(
        ",",
        ""
      )
    );

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : null;
}

/**
 * Convert a product name or custom value
 * into a URL-safe slug.
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
 * Parse image URLs submitted by the
 * ProductImageUploader component.
 */
function parseImageUrls(
  rawValue: string
): ImageUrlResult {
  /*
   * Existing products may temporarily have
   * no image URLs, so an empty value is
   * permitted during editing.
   */
  if (!rawValue.trim()) {
    return {
      urls: [],
      error: "",
    };
  }

  const urls =
    Array.from(
      new Set(
        rawValue
          .split(/\r?\n/)
          .map(
            (value) =>
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

  for (
    const imageUrl of urls
  ) {
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
 * Parse flexible product specifications.
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
      JSON.parse(
        rawValue
      );

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
 * Update one product owned by the currently
 * authenticated and approved seller.
 */
export async function updateProduct(
  productId: string,
  previousState: AdminProductFormState,
  formData: FormData
): Promise<AdminProductFormState> {
  void previousState;

  const {
    user,
  } = await getCurrentSeller();

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

  const name =
    getText(
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

  const brand =
    getText(
      formData,
      "brand"
    );

  const model =
    getText(
      formData,
      "model"
    );

  const sku =
    getText(
      formData,
      "sku"
    );

  const category =
    getText(
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

  const seoTitle =
    getText(
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

  const stock =
    getNumber(
      formData,
      "stock"
    );

  const isActive =
    formData.get(
      "isActive"
    ) === "on";

  /*
   * isFeatured is intentionally not read.
   *
   * Sellers cannot control featured
   * marketplace placement.
   */
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

  if (
    name.length < 2
  ) {
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
   * descriptions. Only an empty description
   * prevents the update.
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
    !Number.isInteger(
      stock
    )
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

  if (
    imageResult.error
  ) {
    fieldErrors.imageUrls =
      imageResult.error;
  }

  if (
    attributesResult.error
  ) {
    fieldErrors.attributes =
      attributesResult.error;
  }

  const slug =
    slugify(
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
   * When the original price is missing or
   * lower than the selling price, use the
   * selling price as the original price.
   */
  const resolvedOriginalPrice =
    originalPriceLkr !==
      null &&
    originalPriceLkr >
      currentPrice
      ? originalPriceLkr
      : currentPrice;

  const discountPercent =
    resolvedOriginalPrice >
    currentPrice
      ? Math.round(
          (
            (
              resolvedOriginalPrice -
              currentPrice
            ) /
            resolvedOriginalPrice
          ) *
            100
        )
      : 0;

  const athimartClient =
    await createClient();

  /*
   * Load the current product only when it
   * belongs to the authenticated seller.
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
    .eq(
      "vendor_id",
      user.id
    )
    .maybeSingle();

  if (
    currentProductError
  ) {
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
        "The selected product does not exist or does not belong to your seller account.",

      fieldErrors: {
        form:
          "Return to your product list and select one of your own products.",
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
            imageUrl
              .trim()
              .length > 0
        )
      : [];

  /*
   * Prevent two products from using the
   * same public URL slug.
   */
  const {
    data: existingSlug,
    error:
      slugLookupError,
  } = await athimartClient
    .from("products")
    .select("id")
    .eq(
      "slug",
      slug
    )
    .neq(
      "id",
      cleanedProductId
    )
    .maybeSingle();

  if (
    slugLookupError
  ) {
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
   * Update only the authenticated seller's
   * own product.
   *
   * is_featured and vendor_id are not included,
   * so their protected values remain unchanged.
   */
  const {
    data: updatedProduct,
    error:
      updateError,
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
    .eq(
      "vendor_id",
      user.id
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
          "The AthiMart database rejected the update. Confirm that the product belongs to your approved seller account.",
      },
    };
  }

  /*
   * Remove uploaded image files that are no
   * longer attached to the updated product.
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
    } =
      await athimartClient.storage
        .from(
          "product-images"
        )
        .remove(
          removedImagePaths
        );

    /*
     * Image cleanup failure must not reverse
     * an otherwise successful product update.
     */
    if (
      imageRemovalError
    ) {
      console.error(
        "AthiMart seller product image cleanup failed:",
        imageRemovalError.message
      );
    }
  }

  revalidatePath(
    "/seller"
  );

  revalidatePath(
    "/seller/products"
  );

  revalidatePath(
    `/seller/products/${cleanedProductId}/edit`
  );

  revalidatePath(
    "/admin/products"
  );

  revalidatePath(
    "/shop"
  );

  revalidatePath(
    "/",
    "layout"
  );

  redirect(
    "/seller/products?updated=1"
  );
}