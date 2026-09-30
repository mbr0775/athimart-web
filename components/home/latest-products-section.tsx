// components/home/latest-products-section.tsx

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Product } from "@/types/product";
import { getProductPath } from "@/lib/products/product-url";


interface LatestProductsSectionProps {
  products: Product[];
}


export default function LatestProductsSection({
  products,
}: LatestProductsSectionProps) {


  if (!products || products.length === 0) {
    return null;
  }


  return (

    <section
      className="
        bg-[#faf7ef]
        py-20
      "
    >

      <div className="athimart-container">


        {/* Heading */}

        <div
          className="
            mb-14
            text-center
          "
        >

          <p
            className="
              text-xs
              uppercase
              tracking-[0.25em]
              text-[#8c8778]
            "
          >
            Recently Added
          </p>


          <h2
            className="
              mt-4
              font-[var(--font-display)]
              text-5xl
              font-light
              text-[#303024]
            "
          >
            Latest Products
          </h2>


        </div>



        {/* Products */}

        <div
          className="
            relative
            grid
            grid-cols-2
            gap-6
            md:grid-cols-4
          "
        >


          {/* Left Arrow */}

          <button
            type="button"
            className="
              absolute
              -left-6
              top-1/2
              z-10
              hidden
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-md
              md:flex
            "
          >

            <ChevronLeft
              className="
                h-5
                w-5
                text-[#777267]
              "
            />

          </button>



          {products.slice(0,4).map((product, index) => (

            <Link
              key={product.id}
              href={getProductPath(product)}
              className="
                group
                text-center
              "
            >


              {/* Image Container */}

              <div
                className="
                  relative
                  aspect-square
                  overflow-hidden
                  rounded-[32px]
                  bg-[#efede7]
                "
              >


                {index === 1 && (

                  <span
                    className="
                      absolute
                      left-3
                      top-3
                      z-20
                      rounded-full
                      bg-[#3d3b2b]
                      px-4
                      py-1
                      text-xs
                      text-white
                    "
                  >
                    Best Seller
                  </span>

                )}



                {product.imageUrls?.[0] ? (

                  <Image
                    src={product.imageUrls[0]}
                    alt={product.name}
                    fill
                    sizes="
                      (max-width:768px) 50vw,
                      25vw
                    "
                    className="
                      object-cover
                      transition
                      duration-700
                      group-hover:scale-105
                    "
                  />

                ) : (

                  <div
                    className="
                      flex
                      h-full
                      items-center
                      justify-center
                      text-6xl
                    "
                  >
                    {product.emoji || "🛍️"}
                  </div>

                )}


              </div>




              {/* Product Name */}

              <h3
                className="
                  mt-6
                  text-lg
                  font-light
                  text-[#494638]
                "
              >

                {product.name}

              </h3>



              {/* Price */}

              <p
                className="
                  mt-2
                  text-sm
                  text-[#777267]
                "
              >

                Rs{" "}
                {product.prices?.LKR?.toLocaleString() ?? "0"}

              </p>


            </Link>

          ))}




          {/* Right Arrow */}

          <button
            type="button"
            className="
              absolute
              -right-6
              top-1/2
              z-10
              hidden
              h-10
              w-10
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-md
              md:flex
            "
          >

            <ChevronRight
              className="
                h-5
                w-5
                text-[#777267]
              "
            />

          </button>


        </div>


      </div>


    </section>

  );

}