"use client";


interface Props {

  checked: boolean;

  onChange: (
    value:boolean
  ) => void;

}



export default function ProductFeaturedDrop({

  checked,

  onChange,

}: Props) {


return (

<div

className="
flex
items-center
gap-3
rounded-lg
border
border-[#e5e7eb]
bg-white
p-4
"

>


<input

type="checkbox"

id="featuredDrop"

name="featuredDrop"

value="true"

checked={checked}

onChange={(e)=>
onChange(
e.target.checked
)

}

className="
h-5
w-5
rounded
"

/>


<div>


<label

htmlFor="featuredDrop"

className="
cursor-pointer
text-sm
font-medium
text-[#111]
"

>

Show in AthiMart Drops

</label>



<p

className="
mt-1
text-xs
text-gray-500
"

>

Display this product in homepage featured collection.

</p>


</div>


</div>

);

}