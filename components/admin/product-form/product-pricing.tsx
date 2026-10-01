"use client";


import type {
  AdminEditableProduct,
} from "@/lib/products/admin-product-edit-service";



interface Props {

  product: AdminEditableProduct;

  errors?: Record<string,string>;

}



export default function ProductPricing({

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
Pricing & Inventory
</p>


<p
className="
mt-1
text-xs
text-gray-500
"
>
Manage product prices, discount and stock.
</p>


</div>





<div
className="
grid
gap-4
md:grid-cols-3
"
>



<div>

<label
className="
text-sm
font-medium
"
>
Price (LKR)
</label>


<input

name="priceLkr"

type="number"

defaultValue={
  product.priceLkr
}

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
errors.priceLkr && (

<p
className="
mt-1
text-xs
text-red-600
"
>

{errors.priceLkr}

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
Original Price (LKR)
</label>


<input

name="originalPriceLkr"

type="number"

defaultValue={
  product.originalPriceLkr
}

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

<label
className="
text-sm
font-medium
"
>
Stock
</label>


<input

name="stock"

type="number"

defaultValue={
  product.stock
}

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
errors.stock && (

<p
className="
mt-1
text-xs
text-red-600
"
>

{errors.stock}

</p>

)

}

</div>




</div>





</section>

);

}