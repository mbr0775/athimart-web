import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { editorialFont } from "@/lib/fonts";
import { getProductPath } from "@/lib/products/product-url";
import type { Product } from "@/types/product";
import styles from "./product-discovery-section.module.css";

const categoryCards = [
  { id: "digital", name: "Digital devices", category: "Explore technology", href: "/category/digital-products", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85", price: null, emoji: "" },
  { id: "fashion", name: "Everyday style", category: "Explore fashion", href: "/category/fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85", price: null, emoji: "" },
  { id: "audio", name: "Audio essentials", category: "Explore accessories", href: "/category/digital-products/audio-devices", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85", price: null, emoji: "" },
];

export default function ProductDiscoverySection({ products }: { products: Product[] }) {
  const catalogCards = products.slice(0, 3).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    href: getProductPath(product),
    image: product.imageUrls[0],
    price: product.prices.LKR > 0 ? `Rs ${product.prices.LKR.toLocaleString("en-LK")}` : null,
    emoji: product.emoji || "📦",
  }));
  const cards = catalogCards.length > 0 ? catalogCards : categoryCards;

  return (
    <section
      aria-labelledby="product-discovery-heading"
      data-home-static
      className={`${styles.section} ${editorialFont.variable}`}
    >
      <div className={styles.layout}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>DISCOVER ATHIMART</p>
          <h2 id="product-discovery-heading" className={styles.heading}>
            Your next favourite starts here.
          </h2>
          <p className={styles.description}>
            Explore technology, fashion, and everyday essentials. Find something
            you love, all in one marketplace.
          </p>
          <Link href="/shop" className={styles.shopLink}>
            Shop our products <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
          <Link href="/#categories" className={styles.categoryLink}>Explore all categories</Link>
        </div>

        <div className={styles.productGrid} data-count={cards.length}>
          {cards.map((card, index) => (
            <Link
              key={card.id}
              href={card.href}
              aria-label={catalogCards.length > 0 ? `View ${card.name}` : `Browse ${card.name.toLowerCase()}`}
              className={`${styles.productCard} ${index === 0 ? styles.primaryCard : ""}`}
            >
              <div className={styles.productImage}>
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    sizes={index === 0 ? "(max-width: 767px) calc(100vw - 40px), 28vw" : "(max-width: 767px) 45vw, 28vw"}
                    className={catalogCards.length > 0 ? styles.catalogImage : styles.categoryImage}
                  />
                ) : (
                  <span className={styles.placeholder} aria-hidden="true">{card.emoji}</span>
                )}
              </div>
              <div className={styles.productDetails}>
                <p className={styles.productCategory}>{card.category}</p>
                <h3 className={styles.productName}>{card.name}</h3>
                {card.price && <p className={styles.productPrice}>{card.price}</p>}
                <ArrowUpRight size={18} aria-hidden="true" className={styles.productArrow} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
