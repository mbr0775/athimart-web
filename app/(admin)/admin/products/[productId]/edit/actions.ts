// app/(admin)/admin/products/[productId]/edit/actions.ts

"use server";

import { parseVariantRows, withoutVariantFields, hasSharedVariantImages } from "@/lib/products/product-variants";
import { buildVariantRows, checkCustomProductSku, getListingToken, isProductSkuConflict, checkVariantGroup } from "@/lib/products/product-variant-save";
import { productListingEmoji, productListingSku } from "@/lib/products/product-listing-identifiers";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getListingAssignment } from "@/lib/shops/listing-assignment";
import { OFFICIAL_SHOP_ID } from "@/lib/shops/shop-identity";
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

  const shopId = getText(formData, "shopId");
  const shippedBy = getText(formData, "shippedBy");

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
  const variants = parseVariantRows(formData);
  if (!variants.valid) fieldErrors.variants = variants.error;

  if (shippedBy.length > 120) {
    fieldErrors.shippedBy = "Keep the dispatch name within 120 characters.";
  }


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

  if (
    !variants.valid ||
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
      "id, slug, sku, emoji, seller_name, image_urls, vendor_id, is_official_listing, attributes, country_code"
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

  const currentShopId = currentProduct.is_official_listing ? OFFICIAL_SHOP_ID : currentProduct.vendor_id ?? "";
  const assignment = await getListingAssignment(athimartClient, shopId, currentShopId);
  if (!assignment) {
    return { message: "Check the seller details.", fieldErrors: { shopId: "Choose an approved shop." } };
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

  const skuError = sku && !currentProduct.sku ? await checkCustomProductSku(athimartClient, sku) : null;
  if (skuError) return { message: "Check the inventory SKU.", fieldErrors: { sku: skuError } };

  const slug = currentProduct.slug;
  const token = getListingToken(formData);

  /*
   * Save the updated product information
   * in the AthiMart database.
   */
  const rows = buildVariantRows({
      ...assignment.listing,
      slug,
      name,

      shipped_by: shippedBy || null,
      company_name:
        companyName,

      brand:
        brand || null,

      model:
        model || null,

      sku: currentProduct.sku || sku.toUpperCase() || productListingSku(name, token, "", assignment.sellerName ?? currentProduct.seller_name ?? ""),

      category,

      sub_category:
        subCategory,

      description,

      seo_title:
        seoTitle || null,

      seo_description:
        seoDescription ||
        null,

      emoji: currentProduct.emoji || productListingEmoji(category, subCategory),

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
        { ...withoutVariantFields(currentProduct.attributes ?? {}), ...withoutVariantFields(attributesResult.attributes) },

      updated_at:
        new Date().toISOString(),
    }, variants, currentProduct.attributes ?? {});
  const country = currentProduct.country_code ?? "LK";
  const vendorId = assignment.listing.vendor_id === undefined ? currentProduct.vendor_id : assignment.listing.vendor_id;
  const official = assignment.listing.is_official_listing ?? currentProduct.is_official_listing;
  const variantConflict = await checkVariantGroup(athimartClient, vendorId, official, country, cleanedProductId, rows);
  if (variantConflict) return { message: "Check product variants.", fieldErrors: { variants: variantConflict } };

  // Bulk upsert saves the existing SKU and new variants in a single statement.
  const result = rows.length > 1
    ? await athimartClient.from("products").upsert(rows.map((row, index) => ({
      ...row,
      id: index === 0 ? cleanedProductId : randomUUID(),
      vendor_id: vendorId,
      is_official_listing: official,
      country_code: country,
    })), { onConflict: "id", defaultToNull: false }).select("id")
    : await athimartClient.from("products").update(rows[0])
      .eq("id", cleanedProductId).select("id");
  const { error: updateError } = result;
  const updatedProduct = result.data?.find((row) => row.id === cleanedProductId);

  if (updateError) {
    if (isProductSkuConflict(updateError)) return { message: "Check the inventory SKU.", fieldErrors: { sku: "This SKU is already in use. Choose another or retry with a new listing." } };

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
    hasSharedVariantImages(currentProduct.attributes) ? [] : getRemovedProductImagePaths(
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