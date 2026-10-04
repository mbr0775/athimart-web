import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { getCategoryPath, productCategories } from "@/config/categories";
import { editorialFont } from "@/lib/fonts";
import type { CategoryPreviews } from "@/lib/products/product-category-service";
import CategoryCard from "./category-card";
import styles from "./shop-category-section.module.css";

// Illustrative covers are only used when a category has no uploaded product photo.
const categoryCovers: Record<string, string> = {
  "digital-products": "photo-1496181133206-80ce9b88a853",
  "it-solutions": "photo-1498050108023-c5249f4df085",
  "ai-gadgets": "photo-1523275335684-37898b6baf30",
  "fitness-tech": "photo-1517836357463-d25dfeac3438",
  "natural-essences": "photo-1608571423902-eed4a5ad8108",
  fashion: "photo-1445205170230-053b83016050",
  vehicles: "photo-1492144534655-ae79c964c9d7",
  "real-estate": "photo-1600596542815-ffad4c1539a9",
};

export default function ShopCategorySection({ previews = {} }: { previews?: CategoryPreviews }) {
  return (
    <section id="categories" aria-labelledby="categories-heading" className={`${styles.section} ${editorialFont.variable}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>ONE MARKETPLACE · {productCategories.length} CATEGORIES</p>
            <h2 id="categories-heading" className={styles.heading}>Shop by Category</h2>
            <p className={styles.subtitle}>Explore everything you need from AthiMart.</p>
          </div>
          <Link href="/shop" className={styles.shopLink}>Explore all products <ArrowUpRight size={19} aria-hidden="true" /></Link>
        </div>
        <div className={styles.grid}>
          {productCategories.map((category, index) => {
            const preview = previews[category.slug];
            const cover = categoryCovers[category.slug] ?? categoryCovers["digital-products"];
            return (
              <CategoryCard
                key={category.slug}
                name={category.name}
                slug={category.slug}
                href={getCategoryPath(category.slug)}
                description={category.shortDescription}
                typeCount={category.subcategories.length}
                image={preview?.imageUrl ?? `https://images.unsplash.com/${cover}?auto=format&fit=crop&w=1200&q=85`}
                imageAlt={preview?.productName ?? `${category.name} collection`}
                isProductImage={Boolean(preview)}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
