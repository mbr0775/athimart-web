import styles from "./status.module.css";
import LoadingMark from "@/components/navigation/loading-mark";

export default function Loading() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <LoadingMark />
      <p>A little discovery is on its way.</p>
      <span className={styles.loadingTrack} aria-hidden="true">
        <span />
      </span>
    </div>
  );
}
