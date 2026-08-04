// lib/products/seller-product-edit-service.ts

import "server-only";

import { getCurrentSeller } from "@/lib/auth/seller";
import { createClient } from "@/lib/supabase/server";

export interface SellerEditableProduct {
  id: string;
  slug: string;
  name: string;
  companyName: string;
  brand: string;
  model: string;
  sku: string;

  category: string;
  subCategory: string;

  description: string;
  seoTitle: string;
  seoDescription: string;
  emoji: string;

  priceLkr: number;
  originalPriceLkr: number;
  stock: number;
  discountPercent: number;

  isActive: boolean;
  isFeatured: boolean;

  imageUrls: string[];

  attributes: Record<
    string,
    unknown
  >;

  countryCode: string;

  createdAt: string;
  updatedAt: string | null;
}

type ProductRow = Record<
  string,
  unknown
>;

const EDITABLE_PRODUCT_COLUMNS = `
  id,
  slug,
  name,
  company_name,
  brand,
  model,
  sku,
  category,
  sub_category,
  description,
  seo_title,
  seo_description,
  emoji,
  price,
  price_lkr,
  original_price,
  original_price_lkr,
  stock,
  discount_percent,
  is_active,
  is_featured,
  image_urls,
  attributes,
  country_code,
  created_at,
  updated_at
`;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toText(
  value: unknown,
  fallback = ""
): string {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value);
}

function toNumber(
  value: unknown,
  fallback = 0
): number {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "number"
  ) {
    return Number.isFinite(
      value
    )
      ? value
      : fallback;
  }

  const parsedValue =
    Number(
      String(value)
        .replaceAll(",", "")
        .replaceAll(
          "LKR",
          ""
        )
        .replaceAll(
          "Rs.",
          ""
        )
        .replaceAll(
          "Rs",
          ""
        )
        .trim()
    );

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : fallback;
}

function toBoolean(
  value: unknown,
  fallback = false
): boolean {
  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0"
  ) {
    return false;
  }

  return fallback;
}

function toImageUrls(
  value: unknown
): string[] {
  if (
    !Array.isArray(value)
  ) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (
            image
          ): image is string =>
            typeof image ===
              "string" &&
            image.trim().length >
              0
        )
        .map(
          (image) =>
            image.trim()
        )
    )
  );
}

function toAttributes(
  value: unknown
): Record<string, unknown> {
  if (
    typeof value !==
      "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value as Record<
    string,
    unknown
  >;
}

function resolvePrice(
  preferredPrice: unknown,
  fallbackPrice: unknown
): number {
  const preferredValue =
    toNumber(
      preferredPrice
    );

  if (
    preferredValue > 0
  ) {
    return preferredValue;
  }

  return toNumber(
    fallbackPrice
  );
}

function mapEditableProduct(
  row: ProductRow
): SellerEditableProduct {
  const priceLkr =
    resolvePrice(
      row.price_lkr,
      row.price
    );

  const originalPriceLkr =
    resolvePrice(
      row.original_price_lkr,
      row.original_price
    ) || priceLkr;

  return {
    id:
      toText(row.id),

    slug:
      toText(row.slug),

    name:
      toText(
        row.name,
        "Unnamed product"
      ),

    companyName:
      toText(
        row.company_name,
        "AthiMart Seller"
      ),

    brand:
      toText(
        row.brand
      ),

    model:
      toText(
        row.model
      ),

    sku:
      toText(
        row.sku
      ),

    category:
      toText(
        row.category,
        "General"
      ),

    subCategory:
      toText(
        row.sub_category,
        "General"
      ),

    description:
      toText(
        row.description
      ),

    seoTitle:
      toText(
        row.seo_title
      ),

    seoDescription:
      toText(
        row.seo_description
      ),

    emoji:
      toText(
        row.emoji
      ) || "📦",

    priceLkr,

    originalPriceLkr,

    stock:
      Math.max(
        0,
        Math.floor(
          toNumber(
            row.stock
          )
        )
      ),

    discountPercent:
      Math.max(
        0,
        toNumber(
          row.discount_percent
        )
      ),

    isActive:
      toBoolean(
        row.is_active
      ),

    isFeatured:
      toBoolean(
        row.is_featured
      ),

    imageUrls:
      toImageUrls(
        row.image_urls
      ),

    attributes:
      toAttributes(
        row.attributes
      ),

    countryCode:
      toText(
        row.country_code
      ) || "LK",

    createdAt:
      toText(
        row.created_at
      ),

    updatedAt:
      toText(
        row.updated_at
      ) || null,
  };
}

/**
 * Load one product owned by the currently
 * authenticated and approved seller.
 *
 * A seller cannot load another seller's
 * product by changing the product ID.
 */
export async function getSellerEditableProduct(
  productId: string
): Promise<
  SellerEditableProduct | null
> {
  const { user } =
    await getCurrentSeller();

  const cleanedProductId =
    productId.trim();

  if (
    !UUID_PATTERN.test(
      cleanedProductId
    )
  ) {
    return null;
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(
      EDITABLE_PRODUCT_COLUMNS
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

  if (error) {
    throw new Error(
      `Unable to load seller product: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return mapEditableProduct(
    data as ProductRow
  );
}