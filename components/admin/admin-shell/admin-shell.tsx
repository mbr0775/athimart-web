"use client";

import {
  useState,
  type ReactNode,
} from "react";


import AdminSidebar from "./admin-sidebar";
import AdminHeader from "./admin-header";


interface AdminShellProps {

  children: ReactNode;

  displayName: string;

  email: string;

}



export default function AdminShell({

  children,

  displayName,

  email,

}: AdminShellProps) {



  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);



  return (

    <div
      className="
        min-h-screen
        bg-[#f5f7fb]
        overflow-x-hidden
      "
    >





      {/* DESKTOP SIDEBAR */}

      <aside
        className="
          hidden
          lg:block
          fixed
          left-0
          top-0
          bottom-0
          w-[270px]
          z-30
        "
      >

        <AdminSidebar
          displayName={displayName}
          email={email}
        />

      </aside>






      {/* MOBILE OVERLAY */}

      {mobileMenuOpen && (

        <div
          onClick={() =>
            setMobileMenuOpen(false)
          }

          className="
            fixed
            inset-0
            bg-black/50
            z-[80]
            lg:hidden
          "

        />

      )}






      {/* MOBILE DRAWER */}

      <aside

        className={`
          fixed
          top-0
          left-0
          h-screen
          w-[280px]
          bg-[#173f9f]
          z-[90]
          lg:hidden
          transition-transform
          duration-300
          ease-in-out
          shadow-2xl

          ${
            mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }

        `}

      >


        <AdminSidebar

          displayName={displayName}

          email={email}

        />


      </aside>









      {/* MAIN CONTENT */}

      <div

        className="
          min-h-screen
          lg:ml-[270px]
        "

      >



        <AdminHeader

          displayName={displayName}

          onMenuClick={() =>
            setMobileMenuOpen(true)
          }

        />




        <main

          className="
            px-4
            sm:px-6
            lg:px-10
            py-8
          "

        >

          {children}

        </main>



      </div>




    </div>

  );

}