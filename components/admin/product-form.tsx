"use client";


import {
  useActionState,
} from "react";


import {
  createProduct,
} from "@/app/(admin)/admin/products/new/actions";


import ProductBasicInfo
from "./product-form/product-basic-info";


import ProductCategoryFields
from "./product-form/product-category-fields";


import ProductDescription
from "./product-form/product-description";


import ProductFeaturedDrop
from "./product-form/product-featured-drop";


import ProductGallery
from "./product-form/product-gallery";


import ProductPricing
from "./product-form/product-pricing";


import ProductSeo
from "./product-form/product-seo";


import type {
  CategoryOption,
} from "./product-form/product-form-types";





interface ProductFormProps {

  categories: CategoryOption[];

}






const emptyProduct = {

  id:"",

  slug:"",

  name:"",

  companyName:"",


  brand:"",

  model:"",

  sku:"",


  category:"",

  subCategory:"",


  description:"",


  seoTitle:"",

  seoDescription:"",


  emoji:"📦",


  priceLkr:0,

  originalPriceLkr:0,


  stock:0,


  discountPercent:0,


  isActive:true,

  isFeatured:false,

  featuredDrop:false,


  imageUrls:[],


  attributes:{},


  countryCode:"LK",


  createdAt:"",

  updatedAt:null,

};






const initialState = {

  message:"",

  fieldErrors:{} as Record<string,string>,

};








export default function ProductForm({

  categories,

}:ProductFormProps){





const [

state,

formAction,

pending

] = useActionState(

  createProduct,

  initialState

);







return (

<form

action={formAction}

className="
space-y-10
"

>






{
state.message && (

<div

className="
rounded-lg
bg-red-50
p-4
text-sm
text-red-600
"

>


<p

className="
font-semibold
"

>

{state.message}

</p>






{
Object.entries(

state.fieldErrors ?? {}

).map(

([key,value]) => (

<li

key={key}

className="
ml-5
list-disc
"

>

{String(value)}

</li>

)

)

}






</div>

)

}







<ProductBasicInfo

product={emptyProduct}

errors={state.fieldErrors}

/>







<ProductCategoryFields

categories={categories}

selectedCategory=""

selectedSubcategory=""

onCategoryChange={()=>{}}

onSubcategoryChange={()=>{}}

errors={state.fieldErrors}

/>







<ProductDescription

product={emptyProduct}

errors={state.fieldErrors}

/>







<ProductPricing

product={emptyProduct}

errors={state.fieldErrors}

/>







<ProductFeaturedDrop

checked={false}

onChange={()=>{}}

/>







<ProductGallery

initialUrls={[]}

/>







<ProductSeo

product={emptyProduct}

errors={state.fieldErrors}

/>







<button

type="submit"

disabled={pending}

className="
rounded-xl
bg-blue-700
px-8
py-3
font-semibold
text-white
disabled:opacity-50
"

>

{

pending

?

"Creating..."

:

"Create Product"

}

</button>







</form>

);

}