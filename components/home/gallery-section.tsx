"use client";

import Image from "next/image";

import {
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";

import { useState } from "react";




const galleryImages = [

  {
    src:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    alt:
      "Fashion marketplace",
  },


  {
    src:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop",
    alt:
      "Online shopping",
  },


  {
    src:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200&auto=format&fit=crop",
    alt:
      "Fashion products",
  },


  {
    src:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    alt:
      "Shoes collection",
  },


  {
    src:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
    alt:
      "Technology products",
  },

];






function GalleryCard({
  image,
}:{
  image:{
    src:string;
    alt:string;
  }
}){


const x = useMotionValue(0);


const rotateY = useTransform(
  x,
  [-150,150],
  [-12,12]
);


const rotateX = useTransform(
  x,
  [-150,150],
  [5,-5]
);



return (


<motion.div


style={{

  rotateY,

  rotateX,

  transformStyle:
  "preserve-3d",

}}



whileHover={{

  scale:1.06,

  y:-20,

}}



drag="x"


dragElastic={0.35}


dragMomentum={true}


onDrag={(event,info)=>{

x.set(info.offset.x);

}}



onDragEnd={()=>{

x.set(0);

}}



className="
relative
h-[340px]
w-[250px]
shrink-0
cursor-grab
active:cursor-grabbing

overflow-hidden

rounded-[45px]

bg-white

shadow-[0_35px_90px_rgba(20,80,120,.25)]

"


>


<Image


src={image.src}


alt={image.alt}


fill


sizes="
250px
"


draggable={false}


className="
object-cover
pointer-events-none

transition-transform
duration-700

"



/>



<div

className="
absolute
inset-0

bg-gradient-to-t

from-black/30

via-transparent

to-transparent

"

/>


</motion.div>


);

}







export default function GallerySection(){



const [isDragging,setIsDragging] =
useState(false);



return (


<section


className="
relative
overflow-hidden

bg-[#d9edf7]

py-28
md:py-36
"



style={{

perspective:"1400px"

}}



>


{/* LIGHT EFFECT */}


<div

className="
absolute
left-1/2
top-0

h-[600px]
w-[900px]

-translate-x-1/2

rounded-full

bg-white/60

blur-3xl

"

/>







<div

className="
relative
mb-20
text-center
"

>


<p

className="
text-xs
tracking-[0.45em]
text-blue-700
"

>

EXPLORE ATHIMART

</p>



<h2

className="
mt-5
font-serif
text-6xl
text-[#101820]

md:text-7xl
"

>

Gallery

</h2>



</div>








{/* DRAG RAIL */}


<motion.div


drag="x"


dragConstraints={{

left:-600,

right:0

}}



dragElastic={0.2}



whileTap={{

cursor:"grabbing"

}}



className="
flex
gap-8

px-10

"

>



{

[

...galleryImages,

...galleryImages

].map((image,index)=>(


<GalleryCard

key={index}

image={image}

/>


))


}



</motion.div>





</section>


);


}