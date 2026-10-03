"use client";


import {
  useEffect,
  useState,
} from "react";


import type { Product } from "@/types/product";


import {
  HeroBackground,
  HeroProductStage,
  HeroContent,
  HeroPagination,

} from "./hero";





interface Props {

  featuredProducts: Product[];

}





export default function HeroCollectionSection({

  featuredProducts,

}: Props) {



  const [
    productIndex,
    setProductIndex

  ] = useState(0);





  useEffect(()=>{


    if(
      featuredProducts.length <= 1
    ){

      return;

    }



    const timer =
      window.setInterval(()=>{


        setProductIndex(
          current =>

          current === featuredProducts.length - 1

          ?

          0

          :

          current + 1

        );


      },5200);



    return ()=>{

      window.clearInterval(timer);

    };


  },[
    featuredProducts.length
  ]);






  const product =
    featuredProducts[productIndex];





  return (

    <section

      className="
        relative
        isolate
        min-h-[760px]
        overflow-hidden
        border-b
        border-black/10
        bg-[#d9dee1]
        text-[#101214]
        md:min-h-[calc(100svh-5rem)]
      "

    >



      {/* Background */}

      <HeroBackground />




      {/* Product */}

      <HeroProductStage

        product={product}

      />





      {/* Bottom Information */}

      <HeroContent

        product={product}

      />





      {/* Slider */}

      <HeroPagination

        products={featuredProducts}

        productIndex={productIndex}

        setProductIndex={setProductIndex}

      />




    </section>


  );

}