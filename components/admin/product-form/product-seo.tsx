"use client";


import type {
  AdminEditableProduct,
} from "@/lib/products/admin-product-edit-service";



interface ProductSeoProps {

  product: AdminEditableProduct;

  errors?: Record<string,string>;

}



export default function ProductSeo({

  product,

  errors = {},

}: ProductSeoProps) {


return (

<section
className="
space-y-4
"
>


<div>

<p
className="
athimart-label
"
>
SEO Information
</p>


<p
className="
mt-1
text-xs
text-gray-500
"
>
Search engine optimization settings.
</p>


</div>





<div>

<label
className="
text-sm
font-medium
"
>
SEO Title
</label>


<input

name="seoTitle"

defaultValue={
  product.seoTitle ?? ""
}

className="
mt-2
w-full
rounded-lg
border
px-4
py-3
"

placeholder="SEO title"

/>


{
errors.seoTitle && (

<p
className="
mt-1
text-xs
text-red-600
"
>

{errors.seoTitle}

</p>

)

}


</div>







<div>

<label
className="
text-sm
font-medium
"
>
SEO Description
</label>


<textarea

name="seoDescription"

defaultValue={
  product.seoDescription ?? ""
}

rows={4}

className="
mt-2
w-full
rounded-lg
border
px-4
py-3
"

placeholder="SEO description"

/>


{
errors.seoDescription && (

<p
className="
mt-1
text-xs
text-red-600
"
>

{errors.seoDescription}

</p>

)

}


</div>





</section>

);

}