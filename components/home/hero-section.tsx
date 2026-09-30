import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    label: "Natural Products",
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

<section className="athimart-home-hero border-b border-[#d8dce5] bg-[#fcfcfe]">


<div className="athimart-container grid min-h-[566px] items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.16fr_0.84fr] lg:gap-16 lg:py-20">


{/* LEFT */}

<div className="max-w-[690px]">


<p className="font-[var(--font-body)] text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--brand-blue)] sm:text-xs">

Connected ecosystem 
<span className="mx-1.5 text-[#a7afbf]">
·
</span>
Next-gen commerce

</p>



<h1 className="mt-5 font-[var(--font-body)] text-[clamp(3.7rem,7.4vw,6.4rem)] font-bold leading-[0.95] tracking-[-0.065em] text-[#111a32]">

Shop
<br/>

Beyond
<br/>

<span className="text-[var(--brand-orange)]">
Ordinary
</span>

</h1>



<p className="mt-7 max-w-[650px] text-[15px] leading-8 text-[#32496f] sm:text-lg">

AthiMart brings technology, AI gadgets, fitness products,
fashion, natural essences and professional digital services
together in one connected marketplace.

</p>



<div className="mt-9 flex flex-col gap-4 sm:flex-row">


<Link
href="/shop"
className="athimart-home-hero-primary-cta inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#2349b9] px-8 text-sm font-semibold text-white"
>

Shop products

<ArrowRight className="h-5 w-5"/>

</Link>



<Link
href="#categories"
className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-[#2349b9] bg-white px-8 text-sm font-semibold text-[#2349b9]"
>

Explore categories

</Link>


</div>


</div>





{/* RIGHT FEATURE CARD */}


<aside className="rounded-2xl border border-[#dbe2ee] bg-white p-6 shadow-[0_16px_30px_rgba(29,59,110,0.08)]">


{featuredProduct ? (

<Link
href={getProductPath(featuredProduct)}
className="group relative block aspect-[1.34/1] overflow-hidden rounded-xl bg-[#101521]"
>


{featuredProduct.imageUrls[0] ? (

<Image
src={featuredProduct.imageUrls[0]}
alt={featuredProduct.name}
fill
sizes="470px"
className="object-cover transition duration-500 group-hover:scale-105"
/>

):(


<div className="flex h-full items-center justify-center text-7xl">

{featuredProduct.emoji}

</div>


)}



<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-16 text-white">


<p className="text-xs text-orange-400">
Featured AI innovation
</p>


<h2 className="mt-2 text-lg font-bold">
{featuredProduct.name}
</h2>


<p className="text-xs text-white/80">

{featuredProduct.subCategory}
 · 
{formatHeroPrice(featuredProduct.prices.LKR)}

</p>


</div>


</Link>


):(


<div className="flex aspect-[1.34/1] items-center justify-center rounded-xl bg-[#101521] text-white">

AthiMart Innovation

</div>


)}



<div className="mt-6">


<p className="text-xs font-semibold uppercase text-gray-400">

Direct category access

</p>


<div className="mt-3 grid gap-2 sm:grid-cols-2">


{heroCategoryLinks.map((category)=>(

<Link
key={category.slug}
href={getCategoryPath(category.slug)}
className="flex items-center justify-between rounded-lg border bg-[#f8fafc] px-3 py-3 text-xs font-medium text-[#19325c]"
>


{category.label}

<ArrowRight className="h-4 w-4"/>


</Link>


))}


</div>


</div>



</aside>


</div>


</section>

);

}