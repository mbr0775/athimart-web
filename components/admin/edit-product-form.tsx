"use client";


import {
  useActionState,
  useState,
} from "react";


import Link from "next/link";


import {
  updateProduct,
} from "@/app/(admin)/admin/products/[productId]/edit/actions";


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
  AdminEditableProduct,
} from "@/lib/products/admin-product-edit-service";


import type {
  AdminProductFormState,
} from "@/types/admin-product-form";


import type {
  CategoryOption,
} from "./product-form/product-form-types";




interface EditProductFormProps {

  product: AdminEditableProduct;

  categories: CategoryOption[];

}





const initialState:AdminProductFormState = {

  message:"",

  fieldErrors:{},

};






export function EditProductForm({

product,

categories,

}:Readonly<EditProductFormProps>) {



const updateProductWithId =
  updateProduct.bind(
    null,
    product.id
  );



const [

state,

formAction,

pending

] = useActionState(

updateProductWithId,

initialState

);





const initialCategory =
product.category ||
categories[0]?.name ||
"";



const categoryRecord =
categories.find(
(item)=>
item.name === initialCategory
);



const initialSubCategory =
product.subCategory ||
categoryRecord
?.subcategories[0]
?.name ||
"";





const [

selectedCategory,

setSelectedCategory

]=useState(
initialCategory
);





const [

selectedSubcategory,

setSelectedSubcategory

]=useState(
initialSubCategory
);





const [

featuredDrop,

setFeaturedDrop

]=useState(
product.featuredDrop ?? false
);






function handleCategoryChange(
value:string
){

setSelectedCategory(value);



const category =
categories.find(
(item)=>
item.name === value
);



setSelectedSubcategory(

category
?.subcategories[0]
?.name
||
""

);

}





return (

<form

action={formAction}

className="
space-y-8
"

>



{state.message && (

<div

className="
border-l-4
border-red-500
bg-red-50
p-4
text-sm
text-red-700
"

>

{state.message}

</div>

)}





<ProductBasicInfo

product={product}

errors={state.fieldErrors}

/>







<ProductCategoryFields

categories={categories}

selectedCategory={selectedCategory}

selectedSubcategory={selectedSubcategory}

onCategoryChange={
handleCategoryChange
}

onSubcategoryChange={
setSelectedSubcategory
}

errors={state.fieldErrors}

/>







<ProductDescription

product={product}

errors={state.fieldErrors}

/>







<ProductPricing

product={product}

errors={state.fieldErrors}

/>







<ProductGallery

initialUrls={
product.imageUrls
}

/>








<ProductFeaturedDrop

checked={featuredDrop}

onChange={
setFeaturedDrop
}

/>







<ProductSeo

product={product}

errors={state.fieldErrors}

/>







<input

type="hidden"

name="featuredDrop"

value={
featuredDrop
?
"true"
:
"false"
}

/>







<div

className="
flex
gap-3
"

>


<button

type="submit"

disabled={pending}

className="
athimart-brand-button
text-white
"

>

{

pending

?

"Updating..."

:

"Save Changes"

}

</button>



<Link

href="/admin/products"

className="
athimart-brand-outline-button
"

>

Cancel

</Link>



</div>






</form>

);


}