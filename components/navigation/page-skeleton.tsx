import styles from "./page-skeleton.module.css";

export default function PageSkeleton() {
  return (
    <section className={styles.page} aria-busy="true" aria-label="Loading page">
      <p className={styles.status} role="status">Getting things ready…</p>
      <div className={styles.heading} aria-hidden="true"><span /><span /></div>
      <div className={styles.grid} aria-hidden="true">
        {[0, 1, 2].map(item => <div key={item} className={styles.card}><div /><span /><span /></div>)}
      </div>
    </section>
  );
}
