"use client";

import Link from "next/link";

import type {
  NavigationItem,
} from "./admin-types";


interface AdminNavigationProps {
  items: NavigationItem[];
  pathname: string;
}



function checkActive(
  pathname: string,
  item: NavigationItem
) {

  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );

}



export default function AdminNavigation({
  items,
  pathname,
}: AdminNavigationProps) {


  return (

    <div className="space-y-2">

      {items.map((item) => {


        const active =
          checkActive(
            pathname,
            item
          );


        const Icon =
          item.icon;



        return (

          <Link

            key={item.href}

            href={item.href}

            className={`
              group
              relative
              flex
              min-h-[52px]
              items-center
              gap-3.5
              rounded-2xl
              px-4
              transition-all
              duration-300

              ${
                active
                  ? 
                  "bg-white/15 text-white shadow-[0_10px_25px_rgba(0,0,0,0.12)]"
                  :
                  "text-white/75 hover:bg-white/10 hover:text-white"
              }
            `}

          >


            {active && (

              <span
                className="
                  absolute
                  -left-1
                  h-7
                  w-1
                  rounded-full
                  bg-orange-400
                "
              />

            )}




            <span
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl

                ${
                  active
                    ?
                    "bg-white text-blue-800"
                    :
                    "bg-white/10 text-white/80"
                }
              `}
            >

              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={1.8}
              />

            </span>




            <span
              className="
                text-[11px]
                font-semibold
              "
            >

              {item.label}

            </span>


          </Link>

        );


      })}

    </div>

  );

}