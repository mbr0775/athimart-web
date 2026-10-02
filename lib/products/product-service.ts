/**
 * AthiMart Product Service
 *
 * Central export gateway.
 *
 * Keep importing products from:
 *
 * "@/lib/products/product-service"
 *
 * Internal service files can change
 * without updating the rest of the application.
 */



// =====================================
// Homepage Product Services
// =====================================

export {

  getActiveProducts,

  getFeaturedProducts,

  getFeaturedDrops,

} from "./product-home-service";






// =====================================
// Product Search & Filtering Services
// =====================================

export {

  getProductsByCategory,

  getProductsBySubcategory,

  getFilteredProducts,

  searchProducts,

  getProductFilterOptions,

} from "./product-query-service";






// =====================================
// Product Detail Services
// =====================================

export {

  getProductBySlug,

  getActiveProductRoutes,

} from "./product-detail-service";