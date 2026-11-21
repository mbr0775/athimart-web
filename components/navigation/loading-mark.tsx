import styles from "./loading-mark.module.css";

export default function LoadingMark({ compact = false }: { compact?: boolean }) {
  return <span className={`${styles.mark} ${compact ? styles.compact : ""}`} aria-hidden="true">
    <span className={styles.orbit} />
    <span className={styles.innerOrbit} />
    <span className={styles.core}>A<span>.</span></span>
  </span>;
}
