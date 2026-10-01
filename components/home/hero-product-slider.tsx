"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
} from "lucide-react";


import type { Product } from "@/types/product";

import {
  getProductPath,
} from "@/lib/products/product-url";



interface HeroProductSliderProps {

  products: Product[];

}



function formatHeroPrice(value:number){

  return `Rs ${new Intl.NumberFormat(
    "en-LK",
    {
      maximumFractionDigits:0,
    }
  ).format(value)}`;

}





export default function HeroProductSlider({

  products,

}:HeroProductSliderProps){



const [activeIndex,setActiveIndex] =
useState(0);




useEffect(()=>{


if(products.length <= 1){

return;

}



const timer =
setInterval(()=>{


setActiveIndex((current)=>{


if(current === products.length - 1){

return 0;

}


return current + 1;


});


},4000);



return ()=>clearInterval(timer);


},[products.length]);





if(!products.length){


return (

<div
className="
flex
aspect-square
items-center
justify-center
bg-[#101521]
text-white
"
>

AthiMart Collection

</div>

);


}




const product =
products[activeIndex];





return (

<div
className="
overflow-hidden
border
border-[#ddd8d1]
bg-white
p-5
shadow-[0_25px_60px_rgba(0,0,0,0.08)]
"
>



<Link

href={getProductPath(product)}

className="
group
block
"

>


<div
className="
relative
aspect-square
overflow-hidden
bg-[#f1eee8]
"
>


{

product.imageUrls?.[0]

?


<Image

key={product.id}

src={product.imageUrls[0]}

alt={product.name}

fill

sizes="480px"

className="
object-cover
transition
duration-700
group-hover:scale-105
"

/>


:

<div
className="
flex
h-full
items-center
justify-center
text-8xl
"
>

{product.emoji}

</div>

}





<div
className="
absolute
bottom-0
left-0
right-0
bg-gradient-to-t
from-black
via-black/70
to-transparent
p-6
pt-24
text-white
"
>


<p
className="
text-xs
uppercase
tracking-[0.25em]
text-orange-300
"
>

Featured Product

</p>



<h2
className="
mt-2
text-xl
font-semibold
"
>

{product.name}

</h2>



<p
className="
mt-2
text-sm
text-white/80
"
>

{product.subCategory}

&nbsp; · &nbsp;

{formatHeroPrice(
product.prices.LKR
)}

</p>



</div>


</div>



</Link>





{/* SLIDER DOTS */}


<div
className="
mt-5
flex
justify-center
gap-2
"
>


{

products.map((item,index)=>(


<button

key={item.id}

onClick={()=>
setActiveIndex(index)
}

className={`
h-2
rounded-full
transition-all
duration-300

${
activeIndex === index

?

"w-8 bg-orange-500"

:

"w-2 bg-gray-300"

}

`}

/>


))

}


</div>






</div>


);


}