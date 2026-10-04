import { getCategoryByName, productCategories } from "@/config/categories";
import { publicSupabase } from "@/lib/supabase/public-client";

export interface CategoryPreview {
  imageUrl: string;
  productName: string;
}

export type CategoryPreviews = Record<string, CategoryPreview>;

/** Use recent public product photos for the same categories used by the admin form. */
export async function getHomeCategoryPreviews(countryCode = "LK"): Promise<CategoryPreviews> {
  const { data, error } = await publicSupabase
    .from("products")
    .select("category,name,image_urls")
    .eq("country_code", countryCode)
    .eq("is_active", true)
    .in("category", productCategories.map((category) => category.name))
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw new Error(`Unable to load category previews: ${error.message}`);

  const previews: CategoryPreviews = {};
  for (const product of data ?? []) {
    const category = getCategoryByName(product.category);
    if (!category || previews[category.slug]) continue;
    const imageUrl = Array.isArray(product.image_urls)
      ? product.image_urls.find((value: unknown) => typeof value === "string" && value.trim())
      : undefined;
    if (imageUrl) {
      previews[category.slug] = { imageUrl, productName: product.name };
    }
  }
  return previews;
}
