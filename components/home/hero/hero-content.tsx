"use client";

import Link from "next/link";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
} from "motion/react";

import {
  ArrowDown,
  ArrowRight,
} from "lucide-react";


import type { Product } from "@/types/product";
import { getProductPath } from "@/lib/products/product-url";



interface Props {

  product?: Product;

}



function formatPrice(value:number){

  return `Rs ${new Intl.NumberFormat("en-LK",{
    maximumFractionDigits:0,
  }).format(value)}`;

}




export default function HeroContent({
  product
}:Props){


const shouldReduceMotion =
useReducedMotion();



return (

<div

className="
athimart-container
relative
z-40
-mt-20
grid
gap-7
pb-8
sm:-mt-24
sm:pb-10
lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
lg:items-end
"

>


{/* Left Content */}

<motion.div

initial={
shouldReduceMotion
?
false
:
{
opacity:0,
y:20
}
}


animate={{
opacity:1,
y:0
}}


transition={{
delay:.45,
duration:.7
}}


className="
max-w-sm
"

>


<p

className="
text-xs
font-semibold
uppercase
tracking-[0.28em]
text-[#123f9e]
"

>

Shop beyond ordinary

</p>



<p

className="
mt-3
text-sm
leading-6
text-black/60
sm:text-base
"

>

Technology, fashion, natural products and digital services,
connected in one marketplace.

</p>




<Link

href="/shop"

className="
group
mt-5
inline-flex
items-center
gap-3
border-b
border-black/35
pb-2
text-sm
font-semibold
uppercase
tracking-[0.16em]
hover:border-[#ff7900]
hover:text-[#ff7900]
"

>

Start shopping


<ArrowRight

className="
h-4
w-4
transition-transform
duration-300
group-hover:translate-x-1
"

/>


</Link>



</motion.div>





{/* Scroll */}

<a

href="#categories"

className="
hidden
flex-col
items-center
gap-3
text-[10px]
uppercase
tracking-[0.3em]
text-black/45
lg:flex
"

>

<span>
Scroll
</span>


<ArrowDown

className="
h-4
w-4
animate-bounce
"

/>


</a>





{/* Product Info */}


<AnimatePresence
mode="wait"
initial={false}
>


{product && (

<motion.div


key={product.id}


initial={
shouldReduceMotion
?
false
:
{
opacity:0,
x:18
}
}


animate={{
opacity:1,
x:0
}}


exit={{
opacity:0,
x:-12
}}



transition={{
duration:.45
}}


className="
border-t
border-black/15
pt-4
lg:justify-self-end
lg:border-l
lg:border-t-0
lg:pl-6
lg:pt-0
lg:text-right
"


>


<p

className="
text-[10px]
uppercase
tracking-[0.28em]
text-black/45
"

>

Featured now

</p>




<Link

href={getProductPath(product)}

className="
mt-2
block
max-w-sm
font-[var(--font-oswald)]
text-2xl
font-light
leading-tight
hover:text-[#123f9e]
sm:text-3xl
"

>

{product.name}


</Link>




<div

className="
mt-2
flex
flex-wrap
gap-x-3
gap-y-1
text-xs
uppercase
tracking-[0.16em]
text-black/55
lg:justify-end
"

>


{
product.subCategory
?
<span>
{product.subCategory}
</span>
:
null
}



<span>

{formatPrice(product.prices.LKR)}

</span>


</div>



</motion.div>


)}


</AnimatePresence>



</div>


);


}