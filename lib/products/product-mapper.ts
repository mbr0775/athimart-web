import type {
  Product,
  ProductPrices,
} from "@/types/product";


import {

  resolvePrice,

  toBooleanValue,

  toNumberValue,

  toStringArray,

  toStringValue,

  toNullableString,

  toAttributes,

} from "./product-utils";



type ProductRow = Record<string, unknown>;





/**
 * Build product prices.
 */
function buildPrices(

  row: ProductRow

): ProductPrices {


  return {


    LKR: resolvePrice(

      row.price_lkr,

      row.price

    ),



    MVR: resolvePrice(

      row.price_mvr,

      row.price

    ),



    USD: resolvePrice(

      row.price_usd,

      row.price

    ),


  };

}





/**
 * Build original prices.
 */
function buildOriginalPrices(

  row: ProductRow,

  prices: ProductPrices

): ProductPrices {


  return {


    LKR: resolvePrice(

      row.original_price_lkr,

      row.original_price,

      prices.LKR

    ),



    MVR: resolvePrice(

      row.original_price_mvr,

      row.original_price,

      prices.MVR

    ),



    USD: resolvePrice(

      row.original_price_usd,

      row.original_price,

      prices.USD

    ),


  };

}





/**
 * Convert Supabase product row
 * into AthiMart Product object.
 */
export function mapProduct(

  row: ProductRow

): Product {


  const prices =
    buildPrices(row);



  return {


    id: toStringValue(

      row.id

    ),



    slug: toStringValue(

      row.slug

    ),



    name: toStringValue(

      row.name,

      "Unnamed product"

    ),




    companyName: toStringValue(

      row.company_name,

      "AthiMart"

    ),



    brand: toNullableString(

      row.brand

    ),



    model: toNullableString(

      row.model

    ),



    sku: toNullableString(

      row.sku

    ),




    category: toStringValue(

      row.category,

      "General"

    ),



    subCategory: toStringValue(

      row.sub_category,

      "General"

    ),




    description: toStringValue(

      row.description

    ),




    seoTitle: toNullableString(

      row.seo_title

    ),




    seoDescription: toNullableString(

      row.seo_description

    ),




    emoji: toStringValue(

      row.emoji,

      "📦"

    ),





    prices,





    originalPrices:
      buildOriginalPrices(

        row,

        prices

      ),





    stock: toNumberValue(

      row.stock

    ),





    discountPercent:

      toNumberValue(

        row.discount_percent

      ),






    isActive:

      toBooleanValue(

        row.is_active,

        true

      ),





    isFeatured:

      toBooleanValue(

        row.is_featured,

        false

      ),





    featuredDrop:

      toBooleanValue(

        row.featured_drop,

        false

      ),





    imageUrls:

      toStringArray(

        row.image_urls

      ),






    attributes:

      toAttributes(

        row.attributes

      ),






    countryCode:

      toStringValue(

        row.country_code,

        "LK"

      ),






    createdAt:

      toStringValue(

        row.created_at

      ),





    updatedAt:

      toNullableString(

        row.updated_at

      ),



  };

}