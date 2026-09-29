"use client";

import Link from "next/link";


interface Props {
  displayName: string;
}


function getInitials(name:string){

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if(parts.length === 0){
    return "A";
  }


  if(parts.length === 1){

    return parts[0]
      .slice(0,2)
      .toUpperCase();

  }


  return (
    parts[0][0] +
    parts.at(-1)?.[0]
  ).toUpperCase();

}



export default function AdminAvatar({
  displayName,
}:Props){


const initials =
  getInitials(displayName);



return(

<Link

href="/account"

aria-label="Open administrator account"

title={displayName}

className="
flex
h-11
w-11
items-center
justify-center
rounded-2xl
bg-[var(--brand-blue)]
font-bold
text-[10px]
!text-white
shadow-[0_10px_25px_rgba(23,73,168,0.24)]
transition-all
duration-300
hover:scale-[1.03]
"

>

<span className="!text-white">

{initials}

</span>


</Link>

)

}