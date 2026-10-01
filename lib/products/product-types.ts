export interface GetActiveProductsOptions {

  countryCode?: string;

  limit?: number;

}



export interface GetFeaturedProductsOptions {

  countryCode?: string;

  limit?: number;

}



export interface GetFeaturedDropsOptions {

  countryCode?: string;

  limit?: number;

}



export interface GetProductsByCategoryOptions {

  categoryName:string;

  countryCode?:string;

  limit?:number;

}



export interface GetProductsBySubcategoryOptions {

  categoryName:string;

  subcategoryName:string;

  countryCode?:string;

  limit?:number;

}



export interface SearchProductsOptions {

  query:string;

  countryCode?:string;

  limit?:number;

}



export interface GetProductFilterOptionsOptions {

  countryCode?:string;

}