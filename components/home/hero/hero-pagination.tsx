"use client";


import type { Product } from "@/types/product";



interface Props {


products: Product[];

productIndex:number;

setProductIndex:(index:number)=>void;


}



export default function HeroPagination({

products,

productIndex,

setProductIndex

}:Props){



if(products.length <= 1){

return null;

}



return (

<div

className="
absolute
bottom-7
right-5
z-50
hidden
items-center
gap-2
sm:right-8
md:flex
lg:right-12
"

>


{

products.map((item,index)=>(


<button

key={item.id}

type="button"

aria-label={`Show ${item.name}`}

onClick={()=>setProductIndex(index)}


className={`

h-1.5
rounded-full
transition-all
duration-300

${
productIndex === index

?

"w-8 bg-[#ff7900]"

:

"w-1.5 bg-black/25 hover:bg-black/45"

}

`}


>


</button>


))


}



</div>


);


}