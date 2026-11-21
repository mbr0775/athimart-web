import Link from "@/components/navigation/navigation-link";
import { ArrowUpRight } from "lucide-react";

import { getCategoryPath, productCategories } from "@/config/categories";
import { categoryCoverPhotos } from "@/config/category-images";
import { editorialFont } from "@/lib/fonts";
import type { CategoryPreviews } from "@/lib/products/product-category-service";
import CategoryCard from "./category-card";
import styles from "./shop-category-section.module.css";

export default function ShopCategorySection({ previews = {} }: { previews?: CategoryPreviews }) {
  return (
    <section id="categories" aria-labelledby="categories-heading" className={`${styles.section} ${editorialFont.variable}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h2 id="categories-heading" className={styles.heading}>Shop by Category</h2>
          </div>
          <Link href="/shop" className={styles.shopLink}>Explore all products <ArrowUpRight size={19} aria-hidden="true" /></Link>
        </div>
        <div className={styles.grid}>
          {productCategories.map((category, index) => {
            const preview = previews[category.slug];
            const cover = categoryCoverPhotos[category.slug] ?? categoryCoverPhotos["digital-products"];
            return (
              <CategoryCard
                key={category.slug}
                name={category.name}
                slug={category.slug}
                href={getCategoryPath(category.slug)}
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
