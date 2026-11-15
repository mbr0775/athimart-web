import { Search } from "lucide-react";
import styles from "./shops.module.css";

export function ShopSearchForm({ query = "", saved = false }: { query?: string; saved?: boolean }) {
  return (
    <form action="/shops" role="search" aria-label="Shop directory search" className={styles.search}>
      <label htmlFor="shop-search" className="sr-only">Search shops</label>
      <input key={query} id="shop-search" type="search" name="q" placeholder="Search by shop name" maxLength={80} defaultValue={query} />
      {saved && <input name="saved" type="hidden" value="1" />}
      <button type="submit"><Search size={18} aria-hidden="true" /> Search</button>
    </form>
  );
}
