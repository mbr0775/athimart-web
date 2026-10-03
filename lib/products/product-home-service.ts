import type { Product } from "@/types/product";

import { publicSupabase } from "@/lib/supabase/public-client";
import { PRODUCT_COLUMNS } from "./product-columns";
import { mapProduct } from "./product-mapper";
import { getSafeLimit } from "./product-utils";

import type {
  GetActiveProductsOptions,
  GetFeaturedProductsOptions,
  GetFeaturedDropsOptions,
} from "./product-types";

function mapProducts(data: unknown[]) {
  return data.map((row) =>
    mapProduct(row as Record<string, unknown>)
  );
}

export async function getActiveProducts({
  countryCode = "LK",
  limit = 6,
}: GetActiveProductsOptions = {}): Promise<Product[]> {
  const safeLimit = getSafeLimit(limit, 6);

  const { data, error } = await publicSupabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("country_code", countryCode)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Unable to load active products: ${error.message}`);
  }

  return mapProducts(data ?? []);
}

export async function getFeaturedProducts({
  countryCode = "LK",
  limit = 6,
}: GetFeaturedProductsOptions = {}): Promise<Product[]> {
  const safeLimit = getSafeLimit(limit, 6);

  const { data, error } = await publicSupabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("country_code", countryCode)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Unable to load featured products: ${error.message}`);
  }

  return mapProducts(data ?? []);
}

export async function getFeaturedDrops({
  countryCode = "LK",
  limit = 8,
}: GetFeaturedDropsOptions = {}): Promise<Product[]> {
  const safeLimit = getSafeLimit(limit, 8);

  const { data, error } = await publicSupabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("country_code", countryCode)
    .eq("is_active", true)
    .eq("featured_drop", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Unable to load AthiMart Drops: ${error.message}`);
  }

  return mapProducts(data ?? []);
}
