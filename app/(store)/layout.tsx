import { GoogleAnalytics } from "@next/third-parties/google";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";


interface StoreLayoutProps {
  children: React.ReactNode;
}


export default async function StoreLayout({
  children,
}: Readonly<StoreLayoutProps>) {
const analyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

return (

<>

<SiteHeader />


<main
id="main-content"
className="min-h-screen"
>

{children}

</main>


<SiteFooter />


<MobileBottomNav />

{analyticsId && <GoogleAnalytics gaId={analyticsId} />}


</>

);


}
