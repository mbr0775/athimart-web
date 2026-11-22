import styles from "./page-skeleton.module.css";
import LoadingMark from "./loading-mark";

export default function PageSkeleton() {
  return (
    <section className={styles.page} aria-busy="true" aria-label="Loading page">
      <div className={styles.status} role="status"><LoadingMark compact /><div><p>Getting things ready<span className={styles.ellipsis}>…</span></p><span>Your next discovery is almost here.</span></div></div>
      <div className={styles.heading} aria-hidden="true"><span /><span /></div>
      <div className={styles.grid} aria-hidden="true">
        {[0, 1, 2].map(item => <div key={item} className={styles.card}><div /><span /><span /></div>)}
      </div>
    </section>
  );
}
