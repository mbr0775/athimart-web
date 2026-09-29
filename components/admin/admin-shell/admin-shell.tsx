"use client";

import {
  usePathname,
} from "next/navigation";


import AdminHeader
from "./admin-header";


import AdminSidebar
from "./admin-sidebar";


import type {
  AdminShellProps,
} from "./admin-types";



export default function AdminShell({

  children,

  displayName,

  email,

}: AdminShellProps) {


  const pathname =
    usePathname();



  return (

    <div
      className="
        min-h-screen
        bg-[#f5f7fb]
      "
    >


      <AdminSidebar

        pathname={pathname}

        displayName={displayName}

        email={email}

      />



      <div
        className="
          lg:pl-[286px]
        "
      >


        <AdminHeader

          title="Dashboard"

          displayName={displayName}

        />



        <main
          className="
            px-8
            py-10
          "
        >

          {children}

        </main>


      </div>


    </div>

  );

}