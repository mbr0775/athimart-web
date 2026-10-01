"use client";


import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";


import {
  ArrowRight,
} from "lucide-react";


import type {
  Product,
} from "@/types/product";


import {
  getProductPath,
} from "@/lib/products/product-url";





interface Props {

  featuredProducts: Product[];

}





const categorySets = [

  [

    {
      title:"AI Gadgets",
      image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    },

    {
      title:"Fashion",
      image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050",
    },

    {
      title:"Natural Essence",
      image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108",
    },

    {
      title:"Digital Services",
      image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72",
    },


  ],



  [

    {
      title:"Technology",
      image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
    },


    {
      title:"Modern Fashion",
      image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b",
    },


    {
      title:"Natural Living",
      image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a",
    },


    {
      title:"Professional Services",
      image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
    },

  ],

];








export default function HeroCollectionSection({

featuredProducts,

}:Props){



const [
productIndex,
setProductIndex
]=useState(0);



const [
categoryIndex,
setCategoryIndex
]=useState(0);





useEffect(()=>{


if(!featuredProducts.length)
return;



const timer=setInterval(()=>{


setProductIndex(
(prev)=>
(prev+1)
%
featuredProducts.length
);



setCategoryIndex(
(prev)=>
(prev+1)
%
categorySets.length
);



},4000);



return ()=>clearInterval(timer);



},[
featuredProducts.length
]);







if(!featuredProducts.length)

return null;






const product =
featuredProducts[productIndex];







return (

<section

className="
bg-[#faf7ef]
border-b
border-[#e5dfd4]
py-16
"

>


<div

className="
mx-auto
max-w-[1400px]
px-6
lg:px-10
"

>



{/* HERO MAIN */}

<div

className="
grid
items-center
gap-12
lg:grid-cols-[1fr_420px]
"

>




{/* LEFT CONTENT */}

<div>



<p

className="
text-xs
uppercase
tracking-[0.35em]
text-[#2349b9]
"

>

CONNECTED MARKETPLACE

</p>





<h1

className="
mt-5
font-[var(--font-oswald)]
text-7xl
font-light
leading-[0.9]
tracking-tight
text-[#111]
sm:text-8xl
"

>

EVERYTHING

<br/>

YOU NEED

<br/>


<span

className="
text-[#ff7a00]
"

>

CONNECTED

</span>



</h1>






<p

className="
mt-7
max-w-xl
text-base
leading-8
text-[#52617b]
"

>

AthiMart connects technology,
fashion, natural products and
digital services through one
connected marketplace.

</p>







<Link

href="/shop"

className="
mt-9
inline-flex
items-center
justify-center
gap-3
rounded-xl
bg-[#2349b9]
px-8
py-4
text-sm
font-semibold
transition-all
duration-300
hover:bg-[#ff7a00]
active:scale-95
"

>


<span className="!text-white">

START SHOPPING

</span>


<ArrowRight

className="
h-5
w-5
!text-white
"

/>



</Link>




</div>








{/* PRODUCT CARD */}


<div

className="
border
border-[#ddd5c8]
bg-white
p-6
transition-all
duration-700
"

>


<p

className="
text-xs
tracking-[0.35em]
text-[#777]
"

>

ATHIMART

</p>




<h2

className="
mt-5
font-[var(--font-oswald)]
text-4xl
font-light
leading-tight
"

>

ONE

<br/>

CONNECTED

<br/>

MARKETPLACE


</h2>







<div

className="
relative
mt-6
aspect-square
overflow-hidden
"

>


<Image

src={
product.imageUrls[0]
}

alt={
product.name
}

fill

sizes="
( max-width:768px )
100vw,
420px
"

className="
object-contain
transition-transform
duration-700
hover:scale-105
"

/>



</div>








<h3

className="
mt-5
text-xl
font-semibold
"

>

{product.name}

</h3>





<p

className="
text-blue-700
"

>

Rs {

new Intl.NumberFormat(
"en-LK"
).format(
product.prices.LKR
)

}

</p>






<Link

href={
getProductPath(product)
}

className="
mt-5
inline-flex
items-center
gap-2
text-sm
font-semibold
text-[#ff7a00]
transition
active:scale-95
"

>


VIEW PRODUCT


<ArrowRight

className="
h-4
w-4
"

/>



</Link>




</div>




</div>








{/* CATEGORY COLLECTION */}



<div

className="
mt-14
grid
gap-5
sm:grid-cols-2
lg:grid-cols-4
"

>


{

categorySets[categoryIndex].map(

(category)=>(



<div

key={category.title}

className="
group
relative
aspect-square
overflow-hidden
transition-all
duration-500
active:scale-95
"

>


<Image

src={
category.image
}

alt={
category.title
}

fill

sizes="
300px
"

className="
object-cover
transition-transform
duration-700
group-hover:scale-110
"

/>






{/* DARK OVERLAY */}

<div

className="
absolute
inset-0
z-10
bg-gradient-to-t
from-black/80
via-black/30
to-transparent
"

/>






<h3

className="
absolute
bottom-6
left-6
z-20
text-2xl
font-light
!text-white
"

>

{category.title}


</h3>





</div>



)

)

}



</div>





</div>



</section>


);


}