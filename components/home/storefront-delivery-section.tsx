import Link from "next/link";
import { ArrowRight } from "lucide-react";

import StorefrontAnimation from "./storefront-animation";
import styles from "./storefront-delivery-section.module.css";

export default function StorefrontDeliverySection() {
  return (
    <section aria-labelledby="storefront-delivery-heading" className="bg-[#faf7ef] py-8 sm:py-12">
      <div className="athimart-container">
        <div className="mx-auto grid max-w-6xl items-center gap-4 overflow-hidden rounded-3xl border border-[#dce8fa] bg-[#eef4ff] p-5 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8 lg:p-10">
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Find it. Love it. Make it yours.</p>
            <h2 id="storefront-delivery-heading" className={styles.heading}>
              From your favourite finds to your doorstep.
            </h2>
            <p className={styles.description}>
              Explore technology, fashion and everyday essentials from the AthiMart marketplace. Your next favourite is just a few clicks away.
            </p>
            <Link href="/shop" className={styles.shopLink}>
              Discover your next find <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div data-home-reveal className="min-w-0"><StorefrontAnimation /></div>
        </div>
      </div>
    </section>
  );
}
