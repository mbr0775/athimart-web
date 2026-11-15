"use client";


import {
  useActionState,
  useState,
} from "react";


import {
  createProduct,
} from "@/app/(admin)/admin/products/new/actions";


import ProductBasicInfo
from "./product-form/product-basic-info";


import ProductCategoryFields
from "./product-form/product-category-fields";


import ProductVariantFields from "@/components/products/product-variant-fields";
import ProductDescription
from "./product-form/product-description";


import ProductFeaturedDrop
from "./product-form/product-featured-drop";


import ProductGallery
from "./product-form/product-gallery";


import ProductSeo
from "./product-form/product-seo";


import type {
  CategoryOption,
} from "./product-form/product-form-types";





interface ProductFormProps {

  categories: CategoryOption[];
  shopOptions: { id: string; name: string }[];

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
  shopOptions,

}:ProductFormProps){

const [selectedCategory, setSelectedCategory] = useState("");
const [selectedSubcategory, setSelectedSubcategory] = useState("");
const [featuredDrop, setFeaturedDrop] = useState(false);





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
shopOptions={shopOptions}

product={emptyProduct}

errors={state.fieldErrors}

/>







<ProductCategoryFields

categories={categories}

selectedCategory={selectedCategory}

selectedSubcategory={selectedSubcategory}

onCategoryChange={(category) => {
  setSelectedCategory(category);
  setSelectedSubcategory("");
}}

onSubcategoryChange={setSelectedSubcategory}

errors={state.fieldErrors}

/>







<ProductVariantFields initialPricing={emptyProduct} errors={state.fieldErrors} />

<ProductDescription

product={emptyProduct}

errors={state.fieldErrors}

/>








<ProductFeaturedDrop

checked={featuredDrop}

onChange={setFeaturedDrop}

/>







<ProductGallery

initialUrls={[]}

allowEmpty

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
bg-[var(--brand)]
px-8
py-3
font-semibold
text-white
disabled:opacity-50
 athimart-brand-button"

>

{

pending

?

"Creating..."

:

"Save Draft"

}

</button>







</form>

);

}
