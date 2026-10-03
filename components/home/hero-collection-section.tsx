"use client";


import {
  useEffect,
  useState,
} from "react";


import type {
  Product,
} from "@/types/product";



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


    if(featuredProducts.length <= 1){

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


z-0



min-h-[850px]


overflow-hidden



bg-[#d9dee1]



text-[#101214]



border-b

border-black/10



pt-20



md:min-h-[calc(100svh-5rem)]



"


>






{/* BACKGROUND */}

<HeroBackground />









{/* PRODUCT */}

<div

className="

relative

z-10

"

>


<HeroProductStage


product={product}


priority={productIndex===0}


/>


</div>









{/* TEXT */}

<div

className="

relative

z-20

"

>

<HeroContent


product={product}


/>


</div>










{/* PAGINATION */}

<div

className="

relative

z-20

"

>


<HeroPagination


products={featuredProducts}


productIndex={productIndex}


setProductIndex={setProductIndex}


/>


</div>






</section>



);


}