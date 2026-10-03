"use client";


import Image from "next/image";


import {
  motion,
} from "motion/react";





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
      "Online shopping experience",
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







export default function GallerySection(){



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





{/* Background Glow */}


<div


aria-hidden="true"


className="
absolute

left-1/2

top-0

h-[500px]

w-[900px]

-translate-x-1/2

rounded-full

bg-white/50

blur-3xl

"

/>






<div


className="
relative

mx-auto

max-w-[1600px]

px-6

lg:px-12

"

>






{/* TITLE */}



<motion.div


initial={{

opacity:0,

y:50,

}}



whileInView={{

opacity:1,

y:0,

}}



viewport={{

once:true,

}}



transition={{

duration:1,

}}



className="
mb-20

text-center

"


>


<p


className="
mb-4

text-xs

tracking-[0.45em]

text-blue-700

"


>

EXPLORE ATHIMART

</p>





<h2


className="
font-serif

text-6xl

tracking-tight

text-[#101820]

md:text-7xl

"


>

Gallery

</h2>



</motion.div>







{/* STATIC 3D GALLERY */}



<motion.div


initial="hidden"


whileInView="visible"


viewport={{

once:true,

amount:.2,

}}



variants={{


hidden:{},



visible:{


transition:{


staggerChildren:.15,

},


},


}}



className="
flex

justify-center

gap-7

overflow-hidden

"


>





{

galleryImages.map((image,index)=>(


<motion.div



key={image.src}



variants={{


hidden:{


opacity:0,

y:80,

rotateX:25,

scale:.85,

},



visible:{


opacity:1,

y:0,

rotateX:0,

scale:1,

},


}}



transition={{


duration:.9,


ease:[

0.22,

1,

0.36,

1,

],


}}




whileHover={{


y:-18,

scale:1.06,

rotateY:8,

}}



style={{


transformStyle:

"preserve-3d",


}}



className="
group

relative

h-[320px]

w-[240px]

shrink-0

overflow-hidden

rounded-[45px]

bg-white

shadow-[0_25px_60px_rgba(0,40,80,.15)]

"


>



<Image


src={image.src}


alt={image.alt}


fill


sizes="
(max-width:768px) 240px,
320px
"



className="
object-cover

transition-transform

duration-700

group-hover:scale-110

"

/>




<div


className="
absolute

inset-0

bg-gradient-to-t

from-black/20

via-transparent

to-transparent

"


/>



</motion.div>


))


}




</motion.div>





</div>



</section>


);


}