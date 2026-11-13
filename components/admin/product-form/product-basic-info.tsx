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
rounded-xl
border
px-4
py-3
 border-[var(--border)] bg-[var(--surface)] focus:border-[var(--brand-hover)]"

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
Manufacturer / Company Name
</label>


<input

name="companyName"

defaultValue={product.companyName}

className="
mt-2
w-full
rounded-xl
border
px-4
py-3
 border-[var(--border)] bg-[var(--surface)] focus:border-[var(--brand-hover)]"

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
rounded-xl
border
px-4
py-3
 border-[var(--border)] bg-[var(--surface)] focus:border-[var(--brand-hover)]"

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
rounded-xl
border
px-4
py-3
 border-[var(--border)] bg-[var(--surface)] focus:border-[var(--brand-hover)]"

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
rounded-xl
border
px-4
py-3
 border-[var(--border)] bg-[var(--surface)] focus:border-[var(--brand-hover)]"

/>

</div>



</div>


<fieldset className="grid gap-4 sm:grid-cols-2">
  <legend className="athimart-label">Seller and dispatch</legend>
  <label className="text-sm font-medium">
    Seller display name
    <input name="sellerName" maxLength={120} defaultValue={product.sellerName}
      className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3" />
  </label>
  <label className="text-sm font-medium">
    Seller type
    <select name="sellerType" defaultValue={product.sellerType || "business"}
      className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <option value="business">Business</option>
      <option value="individual">Individual</option>
    </select>
  </label>
  <label className="text-sm font-medium">
    Shipped by (optional)
    <input name="shippedBy" maxLength={120} defaultValue={product.shippedBy}
      className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3" />
  </label>
  {errors.sellerName && <p role="alert">{errors.sellerName}</p>}
</fieldset>
</section>

);

}