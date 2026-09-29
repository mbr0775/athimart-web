"use client";

import { useState } from "react";
import AdminNavigation from "./admin-navigation";


const navigationItems = [
  {
    label: "Products",
    href: "/admin/products",
    icon: "package",
  },
  {
    label: "Seller Requests",
    href: "/admin/seller-requests",
    icon: "users",
  },
  {
    label: "Manage Sellers",
    href: "/admin/sellers",
    icon: "user",
  },
  {
    label: "Delivery Partners",
    href: "/admin/delivery-partners",
    icon: "truck",
  },
];


interface Props {
  displayName:string;
  email:string;
}


export default function AdminMobileSidebar({
displayName,
email
}:Props){


const [open,setOpen] = useState(false);


return (

<>


{/* Hamburger */}

<button
onClick={()=>setOpen(true)}
className="
lg:hidden
fixed
top-5
left-4
z-50
w-10
h-10
rounded-lg
bg-[#163b91]
text-white
flex
items-center
justify-center
"
>

☰

</button>



{/* Overlay */}

{
open &&

<div
onClick={()=>setOpen(false)}
className="
fixed
inset-0
bg-black/40
z-40
lg:hidden
"
/>

}




{/* Drawer */}

<div
className={`
fixed
top-0
left-0
bottom-0
w-72
bg-[#163b91]
text-white
z-50
transition-transform
duration-300
lg:hidden

${open ? "translate-x-0" : "-translate-x-full"}

`}
>


<div
className="
p-6
border-b
border-white/20
flex
justify-between
"
>

<div>

<h1
className="
text-2xl
tracking-[5px]
"
>
ATHIMART
</h1>

<p
className="
text-[10px]
tracking-[3px]
text-blue-200
"
>
ADMINISTRATION
</p>

</div>


<button
onClick={()=>setOpen(false)}
className="
text-2xl
"
>
×
</button>


</div>



<div className="p-5">


<p
className="
text-xs
tracking-[3px]
text-blue-200
mb-5
"
>
MARKETPLACE MANAGEMENT
</p>


<AdminNavigation
items={navigationItems}
pathname="/admin"
/>


</div>




<div
className="
absolute
bottom-0
left-0
right-0
p-5
border-t
border-white/20
"
>

<p className="font-semibold">
{displayName}
</p>


<p
className="
text-xs
text-blue-200
break-all
"
>
{email}
</p>


</div>



</div>


</>

)

}