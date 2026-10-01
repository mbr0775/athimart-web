import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import {
  getCategoryPath,
} from "@/config/categories";

import type { Product } from "@/types/product";
import { getProductPath } from "@/lib/products/product-url";


interface HeroSectionProps {
  featuredProduct?: Product;
}


const heroCategoryLinks = [
  {
    label: "AI Gadgets",
    slug: "ai-gadgets",
  },
  {
    label: "Technology",
    slug: "digital-products",
  },
  {
    label: "Fashion",
    slug: "fashion",
  },
  {
    label: "Natural",
    slug: "natural-essences",
  },
];



function formatHeroPrice(value:number){

  return `Rs ${new Intl.NumberFormat(
    "en-LK",
    {
      maximumFractionDigits:0,
    }
  ).format(value)}`;

}



export default function HeroSection({
  featuredProduct,
}:HeroSectionProps){


return (

<section
className="
relative
overflow-hidden
border-b
border-[#ddd8d1]
bg-[#faf7ef]
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




{/* LEFT CONTENT */}

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
text-[var(--brand-blue)]
"
>

<Sparkles
className="
h-4
w-4
"
/>

Connected Marketplace

</p>





<h1
className="
mt-6
font-[var(--font-display)]
text-[clamp(3.8rem,8vw,7rem)]
font-light
uppercase
leading-[0.95]
tracking-wide
text-[#171717]
"
>

Everything

<br/>

You Need

<br/>

<span
className="
text-[var(--brand-orange)]
"
>
Connected
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

AthiMart connects customers with trusted sellers,
technology products, fashion, natural products and
digital services through one marketplace.

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





{/* START SHOPPING BUTTON */}


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

bg-[var(--brand-blue)]

px-8

text-sm
font-semibold

uppercase
tracking-wider

!text-white

touch-manipulation

transition-all
duration-200
ease-out


hover:bg-[var(--brand-orange)]

hover:-translate-y-1

hover:shadow-lg


active:scale-95

active:translate-y-0

active:bg-[var(--brand-orange)]


focus-visible:outline-none

focus-visible:ring-2

focus-visible:ring-[var(--brand-orange)]

focus-visible:ring-offset-2
"

>


<span
className="
!text-white
"
>

Start Shopping

</span>




<ArrowRight

className="
h-5
w-5

!text-white

transition-transform
duration-200

group-hover:translate-x-1

group-active:translate-x-1
"

/>



</Link>







{/* EXPLORE BUTTON */}


<Link
href="#categories"

className="
inline-flex

min-h-14

items-center

justify-center

rounded-xl

border-2

border-[var(--brand-blue)]

bg-white

px-8

text-sm

font-semibold

text-[var(--brand-blue)]

transition-all

duration-200


hover:-translate-y-1

hover:shadow-md


active:scale-95

touch-manipulation
"
>

Explore Categories

</Link>



</div>



</div>








{/* RIGHT FEATURE CARD */}


<div
className="
relative
"
>


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


<div
className="
relative

aspect-square

overflow-hidden

bg-[#f1eee8]
"
>



{
featuredProduct?.imageUrls?.[0]

?

<Image

src={featuredProduct.imageUrls[0]}

alt={featuredProduct.name}

fill

sizes="480px"

className="
object-cover

transition

duration-700

hover:scale-105
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
🛍️
</div>

}





<div
className="
absolute

bottom-0

left-0

right-0

bg-gradient-to-t

from-black/80

to-transparent

p-6

pt-20

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

{
featuredProduct?.name ??
"AthiMart Collection"
}

</h2>



{
featuredProduct &&

<p
className="
mt-2

text-sm

text-white/80
"
>

{featuredProduct.subCategory}

&nbsp; · &nbsp;

{formatHeroPrice(
featuredProduct.prices.LKR
)}

</p>

}



</div>


</div>






<div
className="
mt-6
"
>


<p
className="
text-xs

font-semibold

uppercase

tracking-[0.25em]

text-[#999]
"
>

Explore Categories

</p>




<div
className="
mt-4

grid

grid-cols-2

gap-3
"
>


{
heroCategoryLinks.map((category)=>(


<Link

key={category.slug}

href={getCategoryPath(category.slug)}

className="
group

flex

items-center

justify-between

border

border-[#ddd8d1]

bg-[#faf7ef]

px-4

py-3

text-xs

font-medium

text-[#19325c]

transition-all

duration-200


hover:bg-white

active:scale-95
"

>


{category.label}


<ArrowRight

className="
h-4
w-4

transition-transform

group-hover:translate-x-1
"

/>


</Link>


))
}



</div>


</div>


</div>


</div>




</div>


</section>


);

}