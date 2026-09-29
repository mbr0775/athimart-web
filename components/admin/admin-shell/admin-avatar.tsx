interface Props{
name:string;
}


export default function AdminAvatar({
name
}:Props){

const initials =
name
.split(" ")
.map(
x=>x[0]
)
.join("")
.substring(0,2)
.toUpperCase();


return(

<div
className="
w-11
h-11
rounded-full
bg-blue-900
text-white
flex
items-center
justify-center
font-semibold
text-sm
shadow
"
>

{initials}

</div>

)

}