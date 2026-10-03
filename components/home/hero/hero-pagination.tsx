"use client";


import {
  motion
} from "motion/react";


import type {
  Product
} from "@/types/product";




interface Props {


  products: Product[];

  productIndex: number;

  setProductIndex:
    (index:number)=>void;


}





export default function HeroPagination({

  products,

  productIndex,

  setProductIndex,

}: Props) {



  if(products.length <= 1)
  {
    return null;
  }





  return (


    <motion.div


      initial={{
        opacity:0,
        y:30
      }}



      animate={{
        opacity:1,
        y:0
      }}



      transition={{

        duration:.8,

        delay:1.1,

        ease:"easeOut"

      }}



      className="
        absolute
        bottom-10
        left-1/2
        z-50
        flex
        -translate-x-1/2
        items-center
        gap-3
      "

    >





      {
        products.map((product,index)=>(


          <button


            key={product.id}



            onClick={()=>setProductIndex(index)}



            aria-label={
              `Show ${product.name}`
            }



            className="
              relative
              flex
              h-5
              items-center
            "


          >



            {
              productIndex === index

              ?


              (

              <motion.span


                layoutId="hero-active-dot"


                className="
                  block
                  h-[3px]
                  w-12
                  rounded-full
                  bg-black
                "


                transition={{

                  duration:.4,

                  ease:"easeOut"

                }}


              />

              )


              :


              (

              <motion.span


                whileHover={{

                  scale:1.4

                }}



                className="
                  block
                  h-2
                  w-2
                  rounded-full
                  bg-black/30
                  transition-colors
                  hover:bg-black/60
                "

              />

              )

            }





          </button>



        ))

      }





    </motion.div>


  );

}