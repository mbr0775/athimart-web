export const inputClassName =
`
mt-2
min-h-13
w-full
border
border-[var(--border)]
bg-white
px-4
font-[var(--font-body)]
text-sm
text-[var(--text)]
outline-none
transition-colors
placeholder:text-[var(--placeholder)]
focus:border-[var(--brand-blue)]
focus-visible:outline-none
`;


export const textareaClassName =
`
mt-2
w-full
border
border-[var(--border)]
bg-white
px-4
py-3
font-[var(--font-body)]
text-sm
leading-6
text-[var(--text)]
outline-none
transition-colors
placeholder:text-[var(--placeholder)]
focus:border-[var(--brand-blue)]
focus-visible:outline-none
`;



export function getTextValue(
 formData:FormData,
 fieldName:string
){

const value=formData.get(fieldName);


return typeof value==="string"
?
value.trim()
:
"";

}