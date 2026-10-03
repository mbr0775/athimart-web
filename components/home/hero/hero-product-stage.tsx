"use client";


import Image from "next/image";
import Link from "next/link";


import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";



import type {
  Product,
} from "@/types/product";


import {
  getProductPath,
} from "@/lib/products/product-url";






interface Props {

  product?: Product;

  priority?: boolean;

}







export default function HeroProductStage({

  product,

  priority = false,

}: Props) {



  const reduceMotion =
    useReducedMotion();




  if(!product){

    return null;

  }





  const imageSrc =
    product.imageUrls?.[0];








  return (


<div


className="


relative


z-10



flex


justify-center


pointer-events-none



pt-28



sm:pt-24



md:pt-20



"

>



<div


className="


relative



h-[320px]

w-[300px]



sm:h-[390px]

sm:w-[360px]



md:h-[520px]

md:w-[460px]



"




style={{

perspective:"1200px"

}}



>






<AnimatePresence

mode="wait"

initial={false}

>





<motion.div


key={product.id}



initial={

reduceMotion

?

{

opacity:1,

}

:

{

opacity:0,

y:80,

scale:.75,

rotateX:35,

rotateY:-20,

}

}



animate={

reduceMotion

?

{

opacity:1,

}

:

{

opacity:1,

y:0,

scale:1,

rotateX:0,

rotateY:0,

}

}



exit={

{

opacity:0,

scale:.8,

y:-40,

}

}




transition={

{

duration:1.1,

ease:[

0.22,

1,

0.36,

1

]

}

}





className="


relative


h-full


w-full



pointer-events-auto



"




style={{

transformStyle:"preserve-3d"

}}



>







<motion.div


animate={

reduceMotion

?

{}

:

{

y:[0,-12,0],

rotateZ:[-1,1,-1]

}

}



transition={

{

duration:6,

repeat:Infinity,

ease:"easeInOut"

}

}





className="


relative


h-full


w-full



rounded-[45px]


bg-white/70



backdrop-blur-xl



shadow-[0_45px_100px_rgba(0,0,0,.20)]



overflow-hidden



"

>






<Link


href={getProductPath(product)}


className="

block

relative

h-full

w-full

"

>



{imageSrc ? (



<Image


src={imageSrc}


alt={product.name}



fill



priority={priority}



sizes="

(max-width:640px) 300px,

(max-width:1024px) 360px,

460px

"



className="


object-contain



p-8



drop-shadow-[0_30px_45px_rgba(0,0,0,.25)]



"





/>



)

:



<div

className="

flex

h-full

items-center

justify-center

text-8xl

"

>

{product.emoji ?? "📦"}


</div>



}







{/* glass reflection */}


<div


className="


absolute


inset-0



pointer-events-none



bg-gradient-to-br


from-white/60


via-transparent


to-transparent



"




/>



</Link>







</motion.div>






</motion.div>







</AnimatePresence>





</div>






</div>



);


}