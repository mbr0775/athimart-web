import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentProfileIdentity } from "@/lib/account/current-profile";


interface StoreLayoutProps {
  children: React.ReactNode;
}


export default async function StoreLayout({
  children,
}: Readonly<StoreLayoutProps>) {
const identity = await getCurrentProfileIdentity();

return (

<>

<SiteHeader identity={identity} />


<main
id="main-content"
className="min-h-screen"
>

{children}

</main>


<SiteFooter />


<MobileBottomNav identity={identity} />


</>

);


}
