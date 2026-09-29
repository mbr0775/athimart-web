"use client";

import Link from "next/link";


export const adminNavigationItems = [
  {
    label:"Products",
    href:"/admin/products",
    icon:"box",
  },
  {
    label:"Seller Requests",
    href:"/admin/seller-requests",
    icon:"users",
  },
  {
    label:"Manage Sellers",
    href:"/admin/sellers",
    icon:"user",
  },
  {
    label:"Delivery Partners",
    href:"/admin/delivery-partners",
    icon:"truck",
  },
];


interface AdminNavigationProps {
  items: typeof adminNavigationItems;
  pathname:string;
}


export default function AdminNavigation({
items,
pathname
}:AdminNavigationProps){


return (

<nav className="space-y-2">

{
items.map((item)=>(
<Link
key={item.href}
href={item.href}
className={`
block
px-4
py-3
rounded-xl
transition
${
pathname===item.href
?
"bg-white/20 text-white"
:
"text-blue-100 hover:bg-white/10"
}
`}
>

{item.label}

</Link>
))

}

</nav>

)

}