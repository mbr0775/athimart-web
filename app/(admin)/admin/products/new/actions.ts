"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import type { AdminProductFormState } from "@/types/admin-product-form";

interface ImageUrlResult {
  urls: string[];
  error: string;
}

interface AttributesResult {
  attributes: Record<string, unknown>;
  error: string;
}

function getText(
  formData: FormData,
  name: string
): string {
  const value = formData.get(name);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getNumber(
  formData: FormData,
  name: string
): number | null {
  const value = getText(formData, name);

  if (!value) {
    return null;
  }

  const parsedValue = Number(
    value.replaceAll(",", "")
  );

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseImageUrls(
  rawValue: string
): ImageUrlResult {
  const urls = Array.from(
    new Set(
      rawValue
        .split(/\r?\n/)
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );

  if (urls.length === 0) {
    return {
      urls: [],
      error:
        "Add at least one public product image URL.",
    };
  }

  if (urls.length > 6) {
    return {
      urls: [],
      error:
        "Add no more than six product images.",
    };
  }

  for (const imageUrl of urls) {
    try {
      const parsedUrl = new URL(imageUrl);

      if (
        parsedUrl.protocol !== "https:" &&
        parsedUrl.protocol !== "http:"
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
        error: `Invalid image URL: ${imageUrl}`,
      };
    }
  }

  return {
    urls,
    error: "",
  };
}

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
      typeof parsedValue !== "object" ||
      parsedValue === null ||
      Array.isArray(parsedValue)
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

export async function createProduct(
  _previousState: AdminProductFormState,
  formData: FormData
): Promise<AdminProductFormState> {
  await getCurrentAdmin();

  const name = getText(
    formData,
    "name"
  );

  const customSlug = getText(
    formData,
    "slug"
  );

  const companyName = getText(
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

  const subCategory = getText(
    formData,
    "subCategory"
  );

  const description = getText(
    formData,
    "description"
  );

  const seoTitle = getText(
    formData,
    "seoTitle"
  );

  const seoDescription = getText(
    formData,
    "seoDescription"
  );

  const emoji =
    getText(formData, "emoji") ||
    "📦";

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

  const priceLkr = getNumber(
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
    formData.get("isActive") ===
    "on";

  const isFeatured =
    formData.get("isFeatured") ===
    "on";

  const fieldErrors: Record<
    string,
    string
  > = {};

  if (name.length < 2) {
    fieldErrors.name =
      "Enter a product name.";
  }

  if (companyName.length < 2) {
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

  if (description.length < 40) {
    fieldErrors.description =
      "Write a unique description containing at least 40 characters.";
  }

  if (
    priceLkr === null ||
    priceLkr < 0
  ) {
    fieldErrors.priceLkr =
      "Enter a valid Sri Lankan price.";
  }

  if (
    originalPriceLkr !== null &&
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

  if (seoTitle.length > 70) {
    fieldErrors.seoTitle =
      "Keep the SEO title within 70 characters.";
  }

  if (
    seoDescription.length > 160
  ) {
    fieldErrors.seoDescription =
      "Keep the SEO description within 160 characters.";
  }

  if (imageResult.error) {
    fieldErrors.imageUrls =
      imageResult.error;
  }

  if (attributesResult.error) {
    fieldErrors.attributes =
      attributesResult.error;
  }

  const slug = slugify(
    customSlug || name
  );

  if (!slug) {
    fieldErrors.slug =
      "A valid product slug could not be generated.";
  }

  if (
    Object.keys(fieldErrors).length >
    0
  ) {
    return {
      message:
        "Correct the highlighted product fields.",
      fieldErrors,
    };
  }

  const currentPrice =
    priceLkr as number;

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

  const supabase =
    await createClient();

  const {
    data: existingProduct,
    error: slugLookupError,
  } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (slugLookupError) {
    return {
      message:
        "The product slug could not be checked.",
      fieldErrors: {
        slug:
          slugLookupError.message,
      },
    };
  }

  if (existingProduct) {
    return {
      message:
        "A product already uses this slug.",
      fieldErrors: {
        slug:
          "Enter another slug or change the product name.",
      },
    };
  }

  const { error: insertError } =
    await supabase
      .from("products")
      .insert({
        slug,
        name,
        company_name:
          companyName,
        brand: brand || null,
        model: model || null,
        sku: sku || null,
        category,
        sub_category:
          subCategory,
        description,
        seo_title:
          seoTitle || null,
        seo_description:
          seoDescription || null,
        emoji,
        price: currentPrice,
        price_lkr:
          currentPrice,
        original_price:
          resolvedOriginalPrice,
        original_price_lkr:
          resolvedOriginalPrice,
        stock: stock as number,
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
        country_code: "LK",
        updated_at:
          new Date().toISOString(),
      });

  if (insertError) {
    return {
      message:
        "The product could not be created.",
      fieldErrors: {
        form: insertError.message,
      },
    };
  }

  revalidatePath(
    "/admin/products"
  );

  revalidatePath("/shop");

  revalidatePath("/", "layout");

  redirect(
    "/admin/products?created=1"
  );
}