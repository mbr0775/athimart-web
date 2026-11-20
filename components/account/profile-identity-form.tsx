"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, Check, Crop, LoaderCircle } from "lucide-react";
import { saveProfileIdentity } from "@/app/(store)/account/identity-actions";
import type { PhotoCropSettings } from "@/lib/account/photo-crop";
import ProfileAvatar from "./profile-avatar";
import ProfilePhotoEditor from "./profile-photo-editor";
import styles from "./profile-identity-form.module.css";

export default function ProfileIdentityForm({ name, avatarUrl, googleUrl }: { name: string; avatarUrl: string | null; googleUrl: string | null }) {
  const [pending, startTransition] = useTransition();
  const [sourcePhoto, setSourcePhoto] = useState<File | null>(null);
  const [cropSettings, setCropSettings] = useState<PhotoCropSettings | undefined>();
  const [editingPhoto, setEditingPhoto] = useState<File | null>(null);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<"keep" | "upload" | "google">("keep");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const busy = pending || editingPhoto !== null;

  function selectPhoto(file?: File) {
    if (!file) return;
    setMessage("");
    setIsError(false);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024 || !file.size) {
      setMessage("Choose a JPG, PNG or WebP image up to 5 MB.");
      setIsError(true);
      return;
    }
    setEditingPhoto(file);
  }

  return (
    <section className={styles.panel} aria-labelledby="profile-identity-heading">
      <p className={styles.eyebrow}>Make yourself at home</p>
      <h2 id="profile-identity-heading">Your profile</h2>
      <p className={styles.description}>Choose the name and photo you see across AthiMart. Your Google photo is used by default when available.</p>
      <form onSubmit={event => {
        event.preventDefault();
        if (busy) return;
        const form = new FormData(event.currentTarget);
        form.set("photoMode", mode);
        if (mode === "upload" && photo) form.set("photo", photo, "avatar.webp");
        setMessage("");
        startTransition(async () => {
          try {
            const result = await saveProfileIdentity(form);
            setIsError(!result.success);
            setMessage(result.success ? "Profile saved. Your name and photo are updated across AthiMart." : result.message);
            if (result.success) { setMode("keep"); setPhoto(null); setPreview(null); setSourcePhoto(null); }
          } catch {
            setIsError(true);
            setMessage("Your profile could not be saved. Please try again.");
          }
        });
      }}>
        <fieldset disabled={busy} className={styles.fields}>
          <div className={styles.photoRow}>
            <ProfileAvatar name={name} avatarUrl={mode === "upload" ? preview : mode === "google" ? googleUrl : avatarUrl} size={80} />
            <div className={styles.photoControls}>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose profile photo" className="sr-only" tabIndex={-1} onChange={event => { void selectPhoto(event.target.files?.[0]); event.target.value = ""; }} />
              <button ref={photoButtonRef} type="button" className={styles.photoButton} onClick={() => inputRef.current?.click()}><Camera size={16} aria-hidden="true" />Change photo</button>
              {mode === "upload" && sourcePhoto && <button type="button" className={styles.photoButton} onClick={() => setEditingPhoto(sourcePhoto)}><Crop size={16} aria-hidden="true" />Edit crop</button>}
              {googleUrl && <button type="button" className={styles.googleButton} onClick={() => { setMode("google"); setPhoto(null); setPreview(null); setSourcePhoto(null); setMessage(""); }}>Use Google photo</button>}
              <span className={styles.hint}>JPG, PNG or WebP · Up to 5 MB</span>
            </div>
          </div>
          <label className={styles.nameField}>Display name<input name="fullName" key={name} defaultValue={name} required minLength={2} maxLength={120} autoComplete="name" /></label>
        </fieldset>
        <div className={styles.footer}>
          <p role="status" aria-live="polite" data-error={isError}>{message || (mode !== "keep" ? "Photo selected. Save your profile to apply it." : "Your profile photo will appear in your account and navigation.")}</p>
          <button type="submit" disabled={busy}>{pending ? <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{pending ? "Saving…" : "Save profile"}</button>
        </div>
      </form>
      {editingPhoto && <ProfilePhotoEditor file={editingPhoto} initialSettings={editingPhoto === sourcePhoto ? cropSettings : undefined} triggerRef={photoButtonRef} onCancel={() => setEditingPhoto(null)} onApply={(prepared, settings) => {
        setPhoto(prepared);
        setPreview(URL.createObjectURL(prepared));
        setSourcePhoto(editingPhoto);
        setCropSettings(settings);
        setMode("upload");
        setMessage("");
        setIsError(false);
        setEditingPhoto(null);
      }} />}
    </section>
  );
}
