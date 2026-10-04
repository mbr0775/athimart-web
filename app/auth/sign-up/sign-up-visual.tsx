import { Check, Heart, ShoppingBag, Sparkles, Store } from "lucide-react";
import styles from "./sign-up.module.css";

export default function SignUpVisual() {
  return (
    <div className={styles.visual} aria-hidden="true" data-scene-stage>
      <div className={styles.scene} data-signup-scene>
        <span className={styles.sceneGlow} />
        <span className={styles.orbit} /><span className={styles.orbitTwo} />
        <span className={styles.groundShadow} />
        <div className={styles.pedestal}><span /></div>
        <div className={styles.profileStack}>
          <span className={styles.profileBack} />
          <div className={styles.profileCard}>
            <span className={styles.profileBrand}>Athi<span>Mart.</span></span>
            <div className={styles.avatar}><span /><span /></div>
            <span className={styles.profileLine} /><span className={styles.profileLineShort} />
            <span className={styles.profileStatus}><span /> YOUR WORLD, CONNECTED</span>
          </div>
          <span className={styles.verified}><Check size={21} strokeWidth={3} /></span>
        </div>
        <div className={styles.bag}>
          <span className={styles.bagHandleBack} /><span className={styles.bagHandle} /><span className={styles.bagSide} />
          <span className={styles.bagFace}><ShoppingBag size={33} strokeWidth={1.3} /><span>AthiMart</span></span>
        </div>
        <div className={styles.storeTile}><Store size={35} strokeWidth={1.3} /><span /><span /></div>
        <span className={styles.heartTile}><Heart size={24} strokeWidth={1.5} /></span>
        <div className={styles.welcomeTag}><span><Sparkles size={17} /></span><div>A little more possibility.<small>Made for you.</small></div></div>
        <span className={styles.orangeOrb} /><span className={styles.blueOrb} />
        <Sparkles size={24} className={styles.sceneSparkle} />
      </div>
    </div>
  );
}
