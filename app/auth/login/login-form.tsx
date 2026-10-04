"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { login } from "./actions";
import styles from "./login.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submitButton} disabled={pending} aria-busy={pending}>
      <span aria-live="polite">{pending ? "Signing you in…" : "Sign in"}</span>
      {pending ? <LoaderCircle size={19} className={styles.spinner} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}
    </button>
  );
}

export default function LoginForm({ nextPath, errorMessage }: { nextPath: string; errorMessage: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={login} className={styles.form} aria-describedby={errorMessage ? "login-error" : undefined}>
      <input type="hidden" name="next" value={nextPath} />
      {errorMessage && <div id="login-error" className={styles.error} role="alert"><AlertCircle size={18} aria-hidden="true" /><p>{errorMessage}</p></div>}

      <div className={styles.field}>
        <label htmlFor="login-email">Email address</label>
        <div className={styles.inputWrap}>
          <Mail size={18} strokeWidth={1.6} aria-hidden="true" />
          <input id="login-email" type="email" name="email" required autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" />
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.passwordLabel}><label htmlFor="login-password">Password</label><Link href="/auth/forgot-password">Forgot password?</Link></div>
        <div className={styles.inputWrap}>
          <LockKeyhole size={18} strokeWidth={1.6} aria-hidden="true" />
          <input id="login-password" type={showPassword ? "text" : "password"} name="password" required autoComplete="current-password" placeholder="Enter your password" />
          <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} aria-controls="login-password">
            {showPassword ? <EyeOff size={18} strokeWidth={1.6} aria-hidden="true" /> : <Eye size={18} strokeWidth={1.6} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <SubmitButton />
      <p className={styles.secureNote}><ShieldCheck size={14} strokeWidth={1.6} aria-hidden="true" /> Secure sign-in. Your account, protected.</p>
    </form>
  );
}
