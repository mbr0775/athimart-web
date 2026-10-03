"use client";


import {

AnimatePresence,

motion,

useReducedMotion,

} from "motion/react";


import type {

Product,

} from "@/types/product";




interface Props {

product?: Product;

}





export default function HeroContent({

product,

}:Props){



const reduceMotion =
useReducedMotion();



if(!product){

return null;

}






return (


<div


className="


relative


mx-auto


w-full


max-w-[1500px]


pt-6


pb-24


z-20


px-5


sm:px-8


"


>





<div


className="


mx-auto


flex



flex-col


gap-8


items-center


text-center


"

>







{/* LEFT CONTENT */}



<motion.div


initial={

reduceMotion

?

{}

:

{

opacity:0,

y:30

}

}



animate={{

opacity:1,

y:0

}}



transition={{

duration:.8

}}



className="

mx-auto


w-full


max-w-[430px]


order-last

"

>



<p


className="


mx-auto


max-w-[500px]


break-words


mb-3


text-[10px]


tracking-[0.5em]


text-blue-700


"

>

SHOP BEYOND ORDINARY


</p>





<p


className="


text-sm


leading-7


text-slate-600


md:text-base


"

>

Technology, fashion, natural products and digital services,
connected in one marketplace.


</p>







<button


className="


mt-8


border-b


border-black/40


pb-3


text-xs


tracking-[0.45em]


text-black



"


>

START SHOPPING

<span className="ml-4">

→

</span>


</button>





</motion.div>









{/* PRODUCT INFORMATION */}





<AnimatePresence

mode="wait"

>



<motion.div


key={product.id}



initial={

reduceMotion

?

{}

:

{

opacity:0,

x:50,

filter:"blur(10px)"

}

}




animate={{

opacity:1,

x:0,

filter:"blur(0px)"

}}




exit={{

opacity:0,

x:-40,

filter:"blur(10px)"

}}



transition={{

duration:.7,

ease:[

0.22,

1,

0.36,

1

]

}}





className="


text-center


order-first


"





>





<p


className="


mb-2


text-[9px]


tracking-[0.5em]


text-slate-500


"

>

FEATURED NOW


</p>





<h2


className="


max-w-[500px]



text-3xl



font-light



leading-tight



tracking-tight




text-black



sm:text-4xl



md:text-5xl



lg:text-6xl


"

>

{product.name}



</h2>







<div


className="


mt-3


flex


flex-wrap


justify-center


gap-5


text-[10px]


tracking-[0.45em]


text-blue-700


uppercase


"

>





<span>

{product.category}

</span>





<span>

RS {product.prices.LKR.toLocaleString()}

</span>






</div>







</motion.div>



</AnimatePresence>






</div>






</div>


);

}