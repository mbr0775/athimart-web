"use client";

import Link from "next/link";

import {
  Boxes,
  LayoutDashboard,
  ShoppingBag,
  Truck,
  UserRound,
  UsersRound,
  ShieldCheck,
} from "lucide-react";

import AdminNavigation from "./admin-navigation";

import type {
  AdminSidebarProps,
  NavigationItem,
} from "./admin-types";


const managementNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Boxes,
  },
  {
    label: "Seller Requests",
    href: "/admin/seller-requests",
    icon: UsersRound,
  },
  {
    label: "Manage Sellers",
    href: "/admin/sellers",
    icon: UserRound,
  },
  {
    label: "Delivery Partners",
    href: "/admin/delivery-partners",
    icon: Truck,
  },
];


const accountNavigation: NavigationItem[] = [
  {
    label: "View AthiMart Store",
    href: "/shop",
    icon: ShoppingBag,
    externalSection: true,
  },
  {
    label: "My Account",
    href: "/account",
    icon: UserRound,
    externalSection: true,
  },
];



export default function AdminSidebar({

  pathname,
  displayName,
  email,

}: AdminSidebarProps) {


  return (

    <aside
      className="
        fixed
        inset-y-0
        left-0
        z-50
        hidden
        w-[286px]
        flex-col
        overflow-hidden
        border-r
        border-white/10
        bg-[linear-gradient(165deg,#102f78_0%,#1749a8_48%,#102f78_100%)]
        text-white
        shadow-[18px_0_60px_rgba(12,35,91,0.15)]
        lg:flex
      "
    >


      {/* Logo */}

      <div
        className="
          flex
          min-h-24
          items-center
          border-b
          border-white/10
          px-6
        "
      >

        <Link
          href="/admin"
          className="block"
        >

          <div
            className="
              flex
              items-baseline
            "
          >

            <span
              className="
                font-[var(--font-display)]
                text-[29px]
                font-light
                uppercase
                tracking-[0.16em]
                text-white
              "
            >
              ATHI
            </span>


            <span
              className="
                font-[var(--font-display)]
                text-[29px]
                font-light
                uppercase
                tracking-[0.16em]
                text-[var(--brand-orange-light)]
              "
            >
              MART
            </span>


          </div>


          <p
            className="
              mt-1
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.28em]
              text-white/60
            "
          >
            Administration
          </p>


        </Link>


      </div>





      {/* Menu */}

      <nav
        className="
          flex-1
          overflow-y-auto
          px-4
          py-6
        "
      >


        <p
          className="
            mb-3
            px-4
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.24em]
            text-white/60
          "
        >
          Marketplace Management
        </p>



        <AdminNavigation
          items={managementNavigation}
          pathname={pathname}
        />




        <div
          className="
            my-6
            h-px
            bg-white/20
          "
        />



        <p
          className="
            mb-3
            px-4
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.24em]
            text-white/60
          "
        >
          Quick Access
        </p>



        <AdminNavigation
          items={accountNavigation}
          pathname={pathname}
        />


      </nav>





      {/* Admin profile */}

      <div
        className="
          border-t
          border-white/20
          p-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-white/20
            bg-white/10
            p-3
          "
        >


          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[var(--brand-orange)]
              text-xs
              font-bold
              text-white
            "
          >

            {displayName
              .slice(0,2)
              .toUpperCase()
            }

          </div>



          <div
            className="
              min-w-0
              flex-1
            "
          >

            <p
              className="
                truncate
                text-[11px]
                font-semibold
                text-white
              "
            >
              {displayName}
            </p>


            <p
              className="
                truncate
                text-[9px]
                text-white/60
              "
            >
              {email}
            </p>


          </div>



          <ShieldCheck
            className="
              h-4
              w-4
              text-orange-300
            "
          />


        </div>


      </div>


    </aside>

  );

}