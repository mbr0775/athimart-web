"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";


export function SiteHeader(){

const [isMenuOpen, setIsMenuOpen] = useState(false);

return (

<header

className="

fixed

top-0

left-0

right-0


z-[9999]


pointer-events-none


px-3

pt-4


md:px-6

"

>


<nav

className="


pointer-events-auto


relative


mx-auto


flex


max-w-[1450px]


items-center


justify-between


rounded-full


bg-white/85


backdrop-blur-xl


shadow-[0_15px_40px_rgba(0,0,0,.12)]


px-6

py-4



"

>



<Link

href="/"

className="

text-xl

tracking-[0.25em]

font-light

"

>

ATHI<span className="text-orange-500">MART</span>

</Link>




<div

className="

hidden

md:flex

gap-10

text-xs

tracking-[0.25em]

"

>


<Link href="/shop">
SHOP
</Link>


<Link href="/categories">
CATEGORIES
</Link>


<Link href="/markets">
MARKETS
</Link>


<Link href="/why-athimart">
WHY ATHIMART
</Link>


</div>





<div

className="

flex

items-center

gap-5

"

>


<Link
href="/search"
aria-label="Search products"
className="flex items-center justify-center"
>
<Search size={20}/>
</Link>


<Link
href="/account"
aria-label="Open account"
title="Account"
className="flex h-10 w-10 items-center justify-center"
>
<User size={20} aria-hidden="true"/>
</Link>


<Link
href="/cart"
aria-label="Open shopping cart"
title="Shopping cart"
className="flex h-10 w-10 items-center justify-center"
>
<ShoppingBag size={20} aria-hidden="true"/>
</Link>


<button

type="button"
aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
aria-expanded={isMenuOpen}
aria-controls="site-header-menu"
onClick={() => setIsMenuOpen((open) => !open)}

>

{isMenuOpen ? <X size={22}/> : <Menu size={22}/>}

</button>


</div>


{isMenuOpen && (
  <div
    id="site-header-menu"
    className="absolute right-0 top-full mt-3 flex w-56 flex-col gap-1 rounded-2xl bg-white p-3 text-sm shadow-[0_15px_40px_rgba(0,0,0,.16)]"
  >
    <Link
      href="/shop"
      onClick={() => setIsMenuOpen(false)}
      className="rounded-xl px-4 py-3 hover:bg-black/5"
    >
      Shop
    </Link>
    <Link
      href="/search"
      onClick={() => setIsMenuOpen(false)}
      className="rounded-xl px-4 py-3 hover:bg-black/5"
    >
      Search
    </Link>
    <Link
      href="/account"
      onClick={() => setIsMenuOpen(false)}
      className="rounded-xl px-4 py-3 hover:bg-black/5"
    >
      Account
    </Link>
    <Link
      href="/cart"
      onClick={() => setIsMenuOpen(false)}
      className="rounded-xl px-4 py-3 hover:bg-black/5"
    >
      Cart
    </Link>
  </div>
)}


</nav>


</header>


);

}