"use client";

import { useRef, useState, type FormEvent, type RefObject } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, ShieldCheck, ShoppingBag, Store, UserRound } from "lucide-react";
import { signUp } from "./actions";
import styles from "./sign-up.module.css";

function SubmitButton({ isSeller }: { isSeller: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitButton} disabled={pending} aria-busy={pending}>
      <span aria-live="polite">{pending ? "Creating your account…" : isSeller ? "Create seller account" : "Create account"}</span>
      {pending ? <LoaderCircle size={19} className={styles.spinner} aria-hidden="true" /> : <ArrowRight size={19} aria-hidden="true" />}
    </button>
  );
}

function PasswordField({ confirm = false, inputRef, onInput }: {
  confirm?: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onInput: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const id = confirm ? "signup-confirm-password" : "signup-password";
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{confirm ? "Confirm password" : "Password"}</label>
      <div className={styles.inputWrap}>
        <LockKeyhole size={17} strokeWidth={1.6} aria-hidden="true" />
        <input ref={inputRef} id={id} name={confirm ? "confirmPassword" : "password"} type={visible ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder={confirm ? "Repeat password" : "8+ characters"} onInput={onInput} aria-describedby={!confirm ? "signup-password-hint" : undefined} />
        <button type="button" className={styles.passwordToggle} aria-label={`${visible ? "Hide" : "Show"} ${confirm ? "confirmation password" : "password"}`} aria-pressed={visible} aria-controls={id} onClick={() => setVisible((value) => !value)}>
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

export default function SignUpForm({ nextPath, accountType, errorMessage }: {
  nextPath: string;
  accountType: "buyer" | "seller";
  errorMessage: string;
}) {
  const [selectedType, setSelectedType] = useState(accountType);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const isSeller = selectedType === "seller";

  function clearMismatch() {
    confirmationRef.current?.setCustomValidity("");
  }

  function validatePasswords(event: FormEvent<HTMLFormElement>) {
    if (passwordRef.current?.value !== confirmationRef.current?.value) {
      event.preventDefault();
      confirmationRef.current?.setCustomValidity("The two passwords do not match.");
      confirmationRef.current?.reportValidity();
    }
  }

  return (
    <form action={signUp} className={styles.form} onSubmit={validatePasswords} aria-describedby={errorMessage ? "signup-error" : undefined}>
      <input type="hidden" name="next" value={nextPath} />
      {errorMessage && <div id="signup-error" className={styles.error} role="alert"><AlertCircle size={18} aria-hidden="true" /><p>{errorMessage}</p></div>}
      <fieldset className={styles.accountTypes}>
        <legend>I’m here to</legend>
        <div className={styles.accountGrid}>
          {(["buyer", "seller"] as const).map((type) => (
            <label key={type} className={styles.accountOption}>
              <input type="radio" name="accountType" value={type} checked={selectedType === type} onChange={() => setSelectedType(type)} />
              <span className={styles.accountCard}>
                <span className={styles.accountIcon}>{type === "buyer" ? <ShoppingBag size={20} strokeWidth={1.6} aria-hidden="true" /> : <Store size={20} strokeWidth={1.6} aria-hidden="true" />}</span>
                <span className={styles.accountCopy}><strong>{type === "buyer" ? "Shop & discover" : "Sell & grow"}</strong><small>{type === "buyer" ? "Create a buyer account" : "Apply as a seller"}</small></span>
                <span className={styles.radioIndicator}><Check size={10} strokeWidth={3} aria-hidden="true" /></span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="signup-name">Full name</label>
          <div className={styles.inputWrap}><UserRound size={18} strokeWidth={1.6} aria-hidden="true" /><input id="signup-name" type="text" name="fullName" required minLength={2} maxLength={120} autoComplete="name" placeholder="Your full name" /></div>
        </div>
        <div className={styles.field}>
          <label htmlFor="signup-email">Email address</label>
          <div className={styles.inputWrap}><Mail size={18} strokeWidth={1.6} aria-hidden="true" /><input id="signup-email" type="email" name="email" required autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" /></div>
        </div>
        <div className={styles.field}>
          <label htmlFor="signup-phone">Phone number <span className={styles.optional}>(optional)</span></label>
          <div className={styles.inputWrap}><Phone size={18} strokeWidth={1.6} aria-hidden="true" /><input id="signup-phone" type="tel" name="phone" autoComplete="tel" inputMode="tel" maxLength={30} placeholder="+94 77 123 4567" /></div>
        </div>
        <div className={styles.passwordGrid}>
          <PasswordField inputRef={passwordRef} onInput={clearMismatch} />
          <PasswordField confirm inputRef={confirmationRef} onInput={clearMismatch} />
        </div>
      </div>
      <p id="signup-password-hint" className={styles.passwordHint}>Use at least 8 characters for your password.</p>
      <div className={styles.securityNote} aria-live="polite"><ShieldCheck size={18} strokeWidth={1.6} aria-hidden="true" /><p>{isSeller ? "Verify your email, then we’ll review your seller application before you can start selling." : "We’ll send a confirmation email to activate your account. A small step to keep it safe."}</p></div>
      <SubmitButton isSeller={isSeller} />
    </form>
  );
}
