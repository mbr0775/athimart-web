"use client";

import { useFormStatus } from "react-dom";
import { signInWithGoogle } from "@/app/auth/google-action";
import styles from "./google-sign-in.module.css";

function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.button} disabled={pending} aria-busy={pending}>
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.8 6-15.1z" />
        <path fill="#34A853" d="M24 44c5.5 0 10.2-1.8 13.6-4.4l-6.7-5.2a12.4 12.4 0 0 1-6.9 2c-5.3 0-9.8-3.6-11.4-8.4H5.7v5.3A20 20 0 0 0 24 44z" />
        <path fill="#FBBC05" d="M12.6 28a12 12 0 0 1 0-8v-5.3H5.7a20 20 0 0 0 0 18.6z" />
        <path fill="#EA4335" d="M24 11.6c3 0 5.7 1 7.8 3.1l5.9-5.9A19.2 19.2 0 0 0 24 4 20 20 0 0 0 5.7 14.7l6.9 5.3c1.6-4.8 6.1-8.4 11.4-8.4z" />
      </svg>
      <span aria-live="polite">{pending ? "Connecting to Google…" : "Continue with Google"}</span>
    </button>
  );
}

export default function GoogleSignIn({ nextPath, from }: {
  nextPath: string;
  from: "login" | "signup";
}) {
  return (
    <form action={signInWithGoogle} className={styles.form}>
      <input type="hidden" name="next" value={nextPath} />
      <input type="hidden" name="from" value={from} />
      <GoogleButton />
    </form>
  );
}
