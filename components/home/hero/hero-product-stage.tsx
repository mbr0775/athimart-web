"use client";


import Image from "next/image";
import Link from "next/link";


import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";


import type { Product } from "@/types/product";

import {
  getProductPath,
} from "@/lib/products/product-url";



interface Props {

  product?: Product;

}





export default function HeroProductStage({

  product,

}: Props) {



  const shouldReduceMotion =
    useReducedMotion();



  if (!product) {

    return null;

  }



  const imageSrc =
    product.imageUrls?.[0] ?? "";





  return (

    <div

      className="
      athimart-container
      relative
      z-20
      flex
      min-h-[610px]
      items-center
      justify-center
      pt-2
      sm:min-h-[650px]
      md:min-h-[calc(100svh-9rem)]
      "

    >



      {/* Product shadow platform */}

      <div

        aria-hidden="true"

        className="
        absolute
        left-1/2
        top-[69%]
        -z-10
        h-[17vw]
        min-h-[120px]
        w-[72vw]
        max-w-[980px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-[50%]
        bg-white/95
        shadow-[0_-20px_80px_rgba(255,255,255,0.65),0_35px_80px_rgba(44,56,65,0.16)]
        "

      />





      <AnimatePresence

        mode="wait"

      >



        <motion.div


          key={product.id}



          initial={

            shouldReduceMotion

            ?

            {
              opacity:1
            }

            :

            {
              opacity:0,
              y:40,
              scale:0.94
            }

          }



          animate={

            shouldReduceMotion

            ?

            {
              opacity:1
            }

            :

            {
              opacity:1,
              y:[0,-12,0],
              scale:1
            }

          }



          exit={

            {
              opacity:0,
              y:-30
            }

          }



          transition={

            {
              duration:0.8
            }

          }



          className="
          relative
          flex
          h-[420px]
          w-[520px]
          items-center
          justify-center
          sm:h-[500px]
          lg:h-[560px]
          "

        >




          <Link


            href={getProductPath(product)}


            className="
            block
            "

          >



            {
              imageSrc

              ?

              <Image


                key={imageSrc}


                src={imageSrc}


                alt={product.name}


                width={520}


                height={520}


                priority



                sizes="
                (max-width:640px) 80vw,
                (max-width:1024px) 60vw,
                520px
                "



                className="
                h-auto
                w-[520px]
                object-contain
                scale-110
                drop-shadow-[0_35px_45px_rgba(31,42,49,0.28)]
                transition-transform
                duration-700
                hover:scale-[1.15]
                "

              />


              :


              <div

                className="
                flex
                h-full
                items-center
                justify-center
                text-[9rem]
                "

              >

                {product.emoji ?? "📦"}

              </div>


            }



          </Link>



        </motion.div>



      </AnimatePresence>



    </div>


  );

}