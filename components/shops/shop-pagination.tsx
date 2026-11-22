import Link from "@/components/navigation/navigation-link";
import styles from "./shops.module.css";

export const SHOP_PAGE_SIZE = 24;

export function getShopPage(value: string | string[] | undefined) {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(page) && page > 0 && page <= 1_000_000 ? page : 1;
}

export function ShopPagination({ page, hasNext, href }: {
  page: number;
  hasNext: boolean;
  href: (page: number) => string;
}) {
  if (page === 1 && !hasNext) return null;
  return (
    <nav aria-label="Pagination" className={styles.pagination}>
      {page > 1 && <Link href={href(page - 1)}>Previous</Link>}
      <span>Page {page}</span>
      {hasNext && <Link href={href(page + 1)}>Next</Link>}
    </nav>
  );
}
