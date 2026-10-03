"use client";


import {

motion,

} from "motion/react";




export function HeroBackground(){



return (

<div


aria-hidden="true"


className="

absolute

inset-0

z-0

pointer-events-none

overflow-hidden

"

>





<motion.div


animate={{

scale:[1,1.08,1],

opacity:[.35,.55,.35]

}}



transition={{

duration:10,

repeat:Infinity,

ease:"easeInOut"

}}



className="

absolute

left-1/2

top-1/2

h-[650px]

w-[900px]

-translate-x-1/2

-translate-y-1/2

rounded-full

border

border-white/50

"

/>






<div

className="

absolute

left-1/2

top-[70%]

-translate-x-1/2

h-[180px]

w-[75vw]

max-w-[1000px]

rounded-[50%]

bg-white/90

shadow-[0_40px_100px_rgba(0,0,0,.15)]

"

/>







<motion.div


animate={{

x:[-30,30,-30],

}}



transition={{

duration:15,

repeat:Infinity,

ease:"easeInOut"

}}



className="

absolute

inset-0

bg-gradient-to-br

from-white/20

via-transparent

to-blue-100/30

"

/>



</div>


);

}