"use client";


import type {
  AdminEditableProduct,
} from "@/lib/products/admin-product-edit-service";



interface Props {

  product: AdminEditableProduct;

  errors?: Record<string,string>;

}



export default function ProductBasicInfo({

  product,

  errors = {},

}: Props) {


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
Product Information
</p>

</div>





<div
className="
grid
gap-4
md:grid-cols-2
"
>


<div>

<label className="text-sm font-medium">
Product Name
</label>


<input

name="name"

defaultValue={product.name}

className="
mt-2
w-full
rounded-lg
border
px-4
py-3
"

/>


{
errors.name && (

<p
className="
text-xs
text-red-600
mt-1
"
>

{errors.name}

</p>

)

}


</div>







<div>

<label className="text-sm font-medium">
Company Name
</label>


<input

name="companyName"

defaultValue={product.companyName}

className="
mt-2
w-full
rounded-lg
border
px-4
py-3
"

/>

</div>







<div>

<label className="text-sm font-medium">
Brand
</label>


<input

name="brand"

defaultValue={product.brand ?? ""}

className="
mt-2
w-full
rounded-lg
border
px-4
py-3
"

/>

</div>







<div>

<label className="text-sm font-medium">
Model
</label>


<input

name="model"

defaultValue={product.model ?? ""}

className="
mt-2
w-full
rounded-lg
border
px-4
py-3
"

/>

</div>







<div>

<label className="text-sm font-medium">
SKU
</label>


<input

name="sku"

defaultValue={product.sku ?? ""}

className="
mt-2
w-full
rounded-lg
border
px-4
py-3
"

/>

</div>



</div>


</section>

);

}