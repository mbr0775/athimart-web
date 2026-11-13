import styles from "./status.module.css";

export default function Loading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.loadingMark} aria-hidden="true">
        A.
      </span>
      <p>A little discovery is on its way.</p>
      <span className={styles.loadingTrack} aria-hidden="true">
        <span />
      </span>
    </div>
  );
}
