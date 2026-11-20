"use client";

import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { Check, LoaderCircle, RotateCcw, RotateCw, X } from "lucide-react";
import { MAX_AVATAR_UPLOAD_BYTES } from "@/lib/account/profile-identity";
import { drawPhotoCrop, photoCropGeometry, type CropPosition, type PhotoCropSettings } from "@/lib/account/photo-crop";
import styles from "./profile-photo-editor.module.css";

export default function ProfilePhotoEditor({ file, initialSettings, triggerRef, onApply, onCancel }: {
  file: File;
  initialSettings?: PhotoCropSettings;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onApply: (photo: Blob, settings: PhotoCropSettings) => void;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const applying = useRef(false);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [zoom, setZoom] = useState(initialSettings?.zoom ?? 1);
  const [position, setPosition] = useState<CropPosition>(initialSettings?.position ?? { x: 0, y: 0 });
  const [rotation, setRotation] = useState(initialSettings?.rotation ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [triggerRef]);

  useEffect(() => {
    let disposed = false;
    let decoded: ImageBitmap | null = null;
    createImageBitmap(file).then(image => {
      if (disposed) { image.close(); return; }
      decoded = image;
      setBitmap(image);
    }).catch(() => {
      if (!disposed) setError("This photo could not be opened. Cancel and choose another image.");
    });
    return () => { disposed = true; decoded?.close(); };
  }, [file]);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (bitmap && context) drawPhotoCrop(context, bitmap, 512, zoom, position, rotation);
  }, [bitmap, zoom, position, rotation]);

  function movePhoto(event: PointerEvent<HTMLCanvasElement>) {
    if (!drag.current || drag.current.id !== event.pointerId || !bitmap || saving) return;
    const crop = photoCropGeometry(bitmap.width, bitmap.height, zoom, position, rotation);
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    setPosition(previous => ({
      x: crop.width === crop.side ? 0 : Math.max(-1, Math.min(1, previous.x - dx * 2 * crop.side / (bounds.width * (crop.width - crop.side)))),
      y: crop.height === crop.side ? 0 : Math.max(-1, Math.min(1, previous.y - dy * 2 * crop.side / (bounds.height * (crop.height - crop.side)))),
    }));
  }

  async function applyPhoto() {
    if (!bitmap || applying.current) return;
    applying.current = true;
    setSaving(true);
    setError("");
    try {
      const output = document.createElement("canvas");
      output.width = output.height = 512;
      const context = output.getContext("2d");
      if (!context) throw new Error("Image editing unavailable");
      drawPhotoCrop(context, bitmap, 512, zoom, position, rotation);
      const photo = await new Promise<Blob>((resolve, reject) => output.toBlob(blob => {
        if (blob && blob.size <= MAX_AVATAR_UPLOAD_BYTES) resolve(blob);
        else reject(new Error("Image could not be prepared"));
      }, "image/webp", 0.85));
      onApply(photo, { zoom, position, rotation });
    } catch {
      setError("This crop could not be prepared. Please try again or choose another photo.");
    } finally {
      applying.current = false;
      setSaving(false);
    }
  }

  const crop = bitmap ? photoCropGeometry(bitmap.width, bitmap.height, zoom, position, rotation) : null;

  return (
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="photo-editor-title" aria-describedby="photo-editor-description" onCancel={event => { event.preventDefault(); if (!applying.current) onCancel(); }}>
      <div className={styles.header}>
        <div><p className={styles.eyebrow}>Make it yours</p><h2 id="photo-editor-title">Edit profile photo</h2></div>
        <button type="button" className={styles.iconButton} aria-label="Close photo editor" disabled={saving} onClick={onCancel}><X size={20} aria-hidden="true" /></button>
      </div>
      <p id="photo-editor-description" className={styles.description}>Drag to reposition and zoom to crop. The circle shows how your profile photo will look.</p>
      <div className={styles.preview}>
        <canvas ref={canvas} width={512} height={512} aria-label="Profile photo crop preview" className={styles.canvas}
          onPointerDown={event => {
            if (!bitmap || saving || !event.isPrimary || event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
          }}
          onPointerMove={movePhoto}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
          onLostPointerCapture={() => { drag.current = null; }} />
        <div className={styles.circle} aria-hidden="true" />
        {!bitmap && <span className={styles.loading}>{error ? "Preview unavailable" : "Loading photo…"}</span>}
      </div>
      <fieldset className={styles.controls} disabled={!bitmap || saving}>
        <label>Zoom <output>{Math.round(zoom * 100)}%</output><input type="range" min="1" max="3" step="0.01" value={zoom} onChange={event => setZoom(Number(event.target.value))} /></label>
        <label>Horizontal position<input type="range" min="-1" max="1" step="0.01" value={position.x} disabled={crop?.width === crop?.side} onChange={event => setPosition(previous => ({ ...previous, x: Number(event.target.value) }))} /></label>
        <label>Vertical position<input type="range" min="-1" max="1" step="0.01" value={position.y} disabled={crop?.height === crop?.side} onChange={event => setPosition(previous => ({ ...previous, y: Number(event.target.value) }))} /></label>
        <div className={styles.tools}>
          <button type="button" onClick={() => { setRotation(value => (value + 90) % 360); setPosition({ x: 0, y: 0 }); }}><RotateCw size={16} aria-hidden="true" />Rotate</button>
          <button type="button" onClick={() => { setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 }); }}><RotateCcw size={16} aria-hidden="true" />Reset</button>
        </div>
      </fieldset>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.footer}>
        <button type="button" className={styles.cancel} disabled={saving} onClick={onCancel}>Cancel</button>
        <button type="button" className={styles.apply} disabled={!bitmap || saving} onClick={() => void applyPhoto()}>{saving ? <LoaderCircle size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{saving ? "Preparing…" : "Use photo"}</button>
      </div>
    </dialog>
  );
}
