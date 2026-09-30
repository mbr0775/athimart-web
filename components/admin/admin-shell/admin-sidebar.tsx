"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  User,
  Truck,
  Store,
  ShieldCheck,
} from "lucide-react";

import type { ReactNode } from "react";


interface AdminSidebarProps {
  displayName: string;
  email: string;
  mobile?: boolean;
  onClose?: () => void;
}



export default function AdminSidebar({
  displayName,
  email,
  mobile = false,
  onClose,
}: AdminSidebarProps) {


  return (

    <aside
      className="
        flex
        flex-col
        h-dvh
        max-h-dvh
        w-[270px]
        bg-[#20479f]
        text-white
        overflow-hidden
      "
    >


      {/* =====================
          LOGO AREA
      ====================== */}

      <div
        className="
          shrink-0
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
          ATHI<span className="text-orange-400">
            MART
          </span>
        </h1>


        <p
          className="
            mt-1
            text-[10px]
            tracking-[4px]
            text-white/50
            font-bold
          "
        >
          ADMINISTRATION
        </p>


      </div>





      {/* =====================
          SCROLL AREA
      ====================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-4
          pt-6
          pb-6
          sidebar-scroll
        "
      >



        <p
          className="
            px-4
            mb-4
            text-[10px]
            tracking-[3px]
            font-bold
            text-white/50
          "
        >
          MARKETPLACE MANAGEMENT
        </p>




        <MenuItem
          href="/admin"
          text="Dashboard"
          icon={<LayoutDashboard size={18}/>}
          active
          onClick={onClose}
        />


        <MenuItem
          href="/admin/products"
          text="Products"
          icon={<Package size={18}/>}
          onClick={onClose}
        />


        <MenuItem
          href="/admin/seller-requests"
          text="Seller Requests"
          icon={<Users size={18}/>}
          onClick={onClose}
        />



        <MenuItem
          href="/admin/sellers"
          text="Manage Sellers"
          icon={<User size={18}/>}
          onClick={onClose}
        />



        <MenuItem
          href="/admin/delivery"
          text="Delivery Partners"
          icon={<Truck size={18}/>}
          onClick={onClose}
        />





        <div
          className="
            my-7
            border-t
            border-white/20
          "
        />




        <p
          className="
            px-4
            mb-4
            text-[10px]
            tracking-[3px]
            font-bold
            text-white/50
          "
        >
          QUICK ACCESS
        </p>



        <MenuItem
          href="/"
          text="View AthiMart Store"
          icon={<Store size={18}/>}
          onClick={onClose}
        />



        <MenuItem
          href="/admin/account"
          text="My Account"
          icon={<User size={18}/>}
          onClick={onClose}
        />



      </div>





      {/* =====================
          USER CARD
      ====================== */}


      <div
        className="
          shrink-0
          p-4
          border-t
          border-white/20
          bg-[#20479f]
        "
      >


        <div
          className="
            rounded-2xl
            border
            border-white/20
            bg-white/10
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
              shrink-0
            "
          >
            MU
          </div>




          <div
            className="
              flex-1
              min-w-0
            "
          >


            <p
              className="
                text-sm
                font-semibold
                truncate
              "
            >
              {displayName}
            </p>


            <p
              className="
                text-[11px]
                text-white/60
                truncate
              "
            >
              {email}
            </p>


          </div>




          <ShieldCheck
            size={18}
            className="text-orange-400 shrink-0"
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
  active = false,
  onClick,

}:{

  href:string;
  icon:ReactNode;
  text:string;
  active?:boolean;
  onClick?:()=>void;

}){


return (

<Link

href={href}

onClick={onClick}

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



{
active &&

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

}



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

"bg-white text-[#20479f]"

:

"bg-white/10"

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

);


}