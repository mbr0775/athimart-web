"use client";

import { Menu } from "lucide-react";

import AdminAvatar from "./admin-avatar";


interface AdminHeaderProps {
  displayName: string;
  onMenuClick: () => void;
}



export default function AdminHeader({
  displayName,
  onMenuClick,
}: AdminHeaderProps) {


  return (

    <header
      className="
        h-20
        bg-white
        border-b
        border-gray-200
        flex
        items-center
        px-4
        sm:px-6
        lg:px-8
        sticky
        top-0
        z-[70]
      "
    >


      {/* MOBILE HAMBURGER */}

      <button
        onClick={onMenuClick}
        className="
          relative
          z-[80]
          lg:hidden
          w-10
          h-10
          rounded-xl
          bg-[#173f9f]
          text-white
          flex
          items-center
          justify-center
          mr-3
          shrink-0
        "
        aria-label="Open menu"
      >

        <Menu
          size={22}
        />

      </button>





      {/* TITLE */}

      <div
        className="
          flex-1
          min-w-0
        "
      >

        <h1
          className="
            text-xl
            sm:text-2xl
            lg:text-3xl
            font-light
            tracking-wide
            text-[#222]
            truncate
          "
        >

          Dashboard

        </h1>


      </div>







      {/* RIGHT SECTION */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >



        {/* VIEW STORE */}

        <button
          className="
            hidden
            lg:flex
            items-center
            gap-2
            px-5
            py-3
            border
            border-gray-300
            rounded-xl
            text-sm
            text-gray-700
            hover:bg-gray-50
          "
        >

          <span>
            🛍
          </span>

          View Store

        </button>






        {/* ADMIN BADGE */}

        <button
          className="
            hidden
            lg:flex
            items-center
            gap-2
            px-5
            py-3
            rounded-xl
            bg-orange-50
            text-orange-600
            text-sm
            font-medium
          "
        >

          <span>
            🛡
          </span>

          Administrator

        </button>







        {/* AVATAR */}

        <AdminAvatar
          name={displayName}
        />


      </div>



    </header>

  );

}