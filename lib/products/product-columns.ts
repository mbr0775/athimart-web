/**
 * Shared Supabase product columns.
 *
 * Used by:
 * - homepage products
 * - product details
 * - search
 * - category pages
 * - filters
 */


export const PRODUCT_COLUMNS = `

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

  price_mvr,

  price_usd,


  original_price,

  original_price_lkr,

  original_price_mvr,

  original_price_usd,


  stock,


  discount_percent,


  is_active,


  is_featured,


  featured_drop,


  image_urls,


  attributes,


  country_code,


  created_at,


  updated_at

`;