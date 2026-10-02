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





/**
 * Load a single active product by slug.
 */
export async function getProductBySlug(

  slug:string

):Promise<Product | null>{



  const cleanSlug =
    slug.trim();



  if(
    cleanSlug.length === 0
  ){

    return null;

  }




  const {

    data,

    error,

  } = await publicSupabase

    .from("products")

    .select(PRODUCT_COLUMNS)

    .eq(

      "slug",

      cleanSlug

    )

    .eq(

      "is_active",

      true

    )

    .maybeSingle();





  if(error){

    throw new Error(

      `Unable to load product: ${error.message}`

    );

  }





  if(!data){

    return null;

  }





  return mapProduct(

    data as Record<string,unknown>

  );


}





/**
 * Load active product slugs.
 *
 * Used for:
 * - generateStaticParams()
 * - sitemap
 * - SEO routes
 */
export async function getActiveProductRoutes():Promise<

  {
    slug:string;
    category:string;
    subCategory:string;
  }[]

>{



  const {

    data,

    error,

  } = await publicSupabase

    .from("products")

    .select(
      "slug, category, sub_category"
    )

    .eq(

      "is_active",

      true

    );





  if(error){

    throw new Error(

      `Unable to load product routes: ${error.message}`

    );

  }





  return (

    data ?? []

  )

  .map(

    (product)=>(

      {

        slug:
          String(product.slug),

        category:
          String(product.category ?? "General"),

        subCategory:
          String(product.sub_category ?? "General"),

      }

    )

  )

  .filter(

    (product)=>

      product.slug.length > 0

  );


}