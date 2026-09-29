"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Store,
  User,
  ShieldCheck
} from "lucide-react";


interface AdminSidebarProps {
  displayName:string;
  email:string;
}


export default function AdminSidebar({
 displayName,
 email
}:AdminSidebarProps){


return (

<aside
className="
w-[270px]
h-full
bg-[#19439b]
text-white
flex
flex-col
"
>


{/* LOGO */}

<div
className="
px-6
pt-10
pb-6
border-b
border-white/20
"
>

<h1
className="
text-[30px]
tracking-[6px]
font-light
"
>
ATHI<span className="text-orange-400">MART</span>
</h1>


<p
className="
text-[10px]
tracking-[4px]
font-semibold
text-white/50
mt-1
"
>
ADMINISTRATION
</p>


</div>




{/* MENU */}

<div
className="
px-4
pt-6
flex-1
"
>


<p
className="
text-[10px]
tracking-[3px]
font-bold
text-white/50
px-4
mb-4
"
>
MARKETPLACE MANAGEMENT
</p>



<MenuItem
href="/admin"
active
icon={<LayoutDashboard size={18}/>}
text="Dashboard"
/>


<MenuItem
href="/admin/products"
icon={<Package size={18}/>}
text="Products"
/>


<MenuItem
href="/admin/seller-requests"
icon={<Users size={18}/>}
text="Seller Requests"
/>


<MenuItem
href="/admin/sellers"
icon={<User size={18}/>}
text="Manage Sellers"
/>


<MenuItem
href="/admin/delivery"
icon={<Truck size={18}/>}
text="Delivery Partners"
/>





<div
className="
border-t
border-white/20
my-7
"
/>




<p
className="
text-[10px]
tracking-[3px]
font-bold
text-white/50
px-4
mb-4
"
>
QUICK ACCESS
</p>




<MenuItem
href="/"
icon={<Store size={18}/>}
text="View AthiMart Store"
/>



<MenuItem
href="/admin/account"
icon={<User size={18}/>}
text="My Account"
/>


</div>





{/* USER CARD */}

<div
className="
p-4
border-t
border-white/20
"
>


<div
className="
bg-white/10
border
border-white/20
rounded-2xl
p-3
flex
items-center
gap-3
"
>


<div
className="
w-12
h-12
rounded-xl
bg-orange-500
flex
items-center
justify-center
font-bold
"
>
MU
</div>



<div className="flex-1">


<p
className="
text-sm
font-semibold
"
>
{displayName}
</p>


<p
className="
text-[10px]
text-white/60
"
>
{email}
</p>


</div>


<ShieldCheck
size={18}
className="text-orange-400"
/>


</div>



</div>



</aside>

);

}




function MenuItem({
href,
icon,
text,
active=false
}:{
href:string;
icon:React.ReactNode;
text:string;
active?:boolean;
}){


return (

<Link
href={href}
className={`
relative
flex
items-center
gap-4
px-4
py-3
mb-2
rounded-2xl
transition

${active
?
"bg-white/20"
:
"hover:bg-white/10"
}

`}
>


{active && (

<span
className="
absolute
left-0
w-1
h-8
bg-orange-500
rounded-r-full
"
/>

)}



<div
className={`
w-10
h-10
rounded-xl
flex
items-center
justify-center

${active
?
"bg-white text-[#19439b]"
:
"bg-white/10 text-white"
}

`}
>

{icon}

</div>



<span
className="
text-sm
font-semibold
"
>
{text}
</span>



</Link>


)

}