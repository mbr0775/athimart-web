import type { Product } from "@/types/product";


import {
  publicSupabase,
} from "@/lib/supabase/public-client";


import {
  PRODUCT_COLUMNS,
} from "./product-columns";


import {
  mapProduct,
} from "./product-mapper";


import {
  getSafeLimit,
} from "./product-utils";


import type {

  GetProductsByCategoryOptions,

  GetProductsBySubcategoryOptions,

  SearchProductsOptions,

  GetProductFilterOptionsOptions,

} from "./product-types";





/**
 * Products by category
 */
export async function getProductsByCategory({

  categoryName,

  countryCode = "LK",

  limit = 24,

}:GetProductsByCategoryOptions):Promise<Product[]> {



  const safeLimit =
    getSafeLimit(
      limit,
      24
    );



  const {

    data,

    error,

  } = await publicSupabase

    .from("products")

    .select(PRODUCT_COLUMNS)

    .eq(
      "country_code",
      countryCode
    )

    .eq(
      "category",
      categoryName
    )

    .eq(
      "is_active",
      true
    )

    .order(
      "created_at",
      {
        ascending:false,
      }
    )

    .limit(
      safeLimit
    );



  if(error){

    throw new Error(
      `Unable to load category products: ${error.message}`
    );

  }



  return (

    data ?? []

  ).map(

    (row)=>

      mapProduct(
        row as Record<string,unknown>
      )

  );

}





/**
 * Products by subcategory
 */
export async function getProductsBySubcategory({

  categoryName,

  subcategoryName,

  countryCode = "LK",

  limit = 24,

}:GetProductsBySubcategoryOptions):Promise<Product[]> {



  const safeLimit =
    getSafeLimit(
      limit,
      24
    );



  const {

    data,

    error,

  } = await publicSupabase

    .from("products")

    .select(PRODUCT_COLUMNS)

    .eq(
      "country_code",
      countryCode
    )

    .eq(
      "category",
      categoryName
    )

    .eq(
      "sub_category",
      subcategoryName
    )

    .eq(
      "is_active",
      true
    )

    .order(
      "created_at",
      {
        ascending:false,
      }
    )

    .limit(
      safeLimit
    );



  if(error){

    throw new Error(
      `Unable to load subcategory products: ${error.message}`
    );

  }



  return (

    data ?? []

  ).map(

    (row)=>

      mapProduct(
        row as Record<string,unknown>
      )

  );

}





/**
 * Search products
 */
export async function searchProducts({

  query,

  countryCode = "LK",

  limit = 24,

}:SearchProductsOptions):Promise<Product[]> {



  const cleanQuery =
    query.trim();



  if(
    cleanQuery.length === 0
  ){

    return [];

  }



  const safeLimit =
    getSafeLimit(
      limit,
      24
    );



  const {

    data,

    error,

  } = await publicSupabase

    .from("products")

    .select(PRODUCT_COLUMNS)

    .eq(
      "country_code",
      countryCode
    )

    .eq(
      "is_active",
      true
    )

    .or(
      `
      name.ilike.%${cleanQuery}%,
      description.ilike.%${cleanQuery}%,
      category.ilike.%${cleanQuery}%,
      brand.ilike.%${cleanQuery}%
      `
    )

    .limit(
      safeLimit
    );



  if(error){

    throw new Error(
      `Unable to search products: ${error.message}`
    );

  }



  return (

    data ?? []

  ).map(

    (row)=>

      mapProduct(
        row as Record<string,unknown>
      )

  );

}





/**
 * Product filter options
 */
export async function getProductFilterOptions({

  countryCode = "LK",

}:GetProductFilterOptionsOptions = {}) {



  const {

    data,

    error,

  } = await publicSupabase

    .from("products")

    .select(
      `
      category,
      sub_category,
      brand
      `
    )

    .eq(
      "country_code",
      countryCode
    )

    .eq(
      "is_active",
      true
    );



  if(error){

    throw new Error(
      `Unable to load product filters: ${error.message}`
    );

  }




  const categories =
    Array.from(

      new Set(

        (data ?? [])

          .map(
            item=>item.category
          )

          .filter(Boolean)

      )

    );




  const subcategories =
    Array.from(

      new Set(

        (data ?? [])

          .map(
            item=>item.sub_category
          )

          .filter(Boolean)

      )

    );




  const brands =
    Array.from(

      new Set(

        (data ?? [])

          .map(
            item=>item.brand
          )

          .filter(Boolean)

      )

    );




  return {

    categories,

    subcategories,

    brands,

  };

}