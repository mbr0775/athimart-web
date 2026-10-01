import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import type { Product } from "@/types/product";

import HeroProductSlider from "./hero-product-slider";



interface HeroSectionProps {
  featuredProducts?: Product[];
}



export default function HeroSection({
  featuredProducts = [],
}: HeroSectionProps) {


return (

<section
className="
border-b
border-[#ddd8d1]
bg-[#faf7ef]
overflow-hidden
"
>


<div
className="
athimart-container

grid

min-h-[650px]

items-center

gap-12

py-16

lg:grid-cols-[1fr_480px]

lg:py-20

"
>



{/* LEFT SIDE */}


<div>


<p
className="
flex
items-center
gap-2

text-xs

font-semibold

uppercase

tracking-[0.3em]

text-[#2349b9]
"
>

<Sparkles className="h-4 w-4"/>

Connected Marketplace

</p>




<h1
className="
mt-6

font-[var(--font-display)]

text-[clamp(3.5rem,8vw,6.8rem)]

font-light

leading-[0.95]

tracking-tight

text-[#151515]

"
>

SHOP

<br/>

BEYOND

<br/>

<span
className="
text-[#ff7800]
"
>

ORDINARY

</span>


</h1>




<p
className="
mt-8

max-w-xl

text-base

leading-8

text-[#555]

sm:text-lg

"
>

AthiMart brings technology, AI gadgets,
fitness products, fashion, natural products
and professional digital services together
in one connected marketplace.

</p>






<div
className="
mt-10

flex

flex-col

gap-4

sm:flex-row

"
>



<Link

href="/shop"

className="
group

inline-flex

min-h-14

items-center

justify-center

gap-3

rounded-xl

bg-[#2349b9]

px-8

text-sm

font-semibold

uppercase

tracking-wider

!text-white


transition-all

duration-300


hover:-translate-y-1

hover:bg-[#ff7800]

hover:shadow-xl


active:scale-95

touch-manipulation

"

>


<span className="!text-white">

Start Shopping

</span>


<ArrowRight
className="
h-5
w-5

transition-transform

duration-300

group-hover:translate-x-1

"
/>


</Link>





<Link

href="#categories"

className="
inline-flex

min-h-14

items-center

justify-center

rounded-xl

border-2

border-[#2349b9]

bg-white

px-8

text-sm

font-semibold

text-[#2349b9]


transition-all

duration-300


hover:-translate-y-1

active:scale-95

"

>

Explore Categories

</Link>



</div>



</div>







{/* PRODUCT SLIDER */}



<div>

<HeroProductSlider

products={featuredProducts}

/>


</div>





</div>


</section>


);


}