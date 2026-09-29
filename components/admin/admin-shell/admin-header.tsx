"use client";


import Link from "next/link";

import {
 ShoppingBag,
 ShieldCheck
} from "lucide-react";


import AdminAvatar
from "./admin-avatar";


import type {
 AdminHeaderProps
} from "./admin-types";



export default function AdminHeader({

title,
displayName

}:AdminHeaderProps){



return(

<header
className="
sticky
top-0
z-40
border-b
bg-white/80
backdrop-blur-xl
"
>


<div
className="
flex
min-h-[78px]
items-center
justify-between
px-8
"
>


<h1
className="
text-3xl
font-light
uppercase
"
>

{title}

</h1>



<div
className="
flex
items-center
gap-3
"
>


<Link
href="/shop"
className="
flex
items-center
gap-2
rounded-xl
border
px-4
py-2
"
>

<ShoppingBag
className="h-4 w-4"
/>

View Store

</Link>


<div
className="
flex
items-center
gap-2
rounded-xl
bg-orange-50
px-4
py-2
text-orange-600
"
>

<ShieldCheck
className="h-4 w-4"
/>

Administrator

</div>


<AdminAvatar
displayName={displayName}
/>


</div>


</div>


</header>

)

}