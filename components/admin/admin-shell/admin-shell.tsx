"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";
import AdminHeader from "./admin-header";
import styles from "@/components/layout/workspace-shell.module.css";

export default function AdminShell({
  children,
  displayName,
  email,
}: {
  children: ReactNode;
  displayName: string;
  email: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const query = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (query.matches) dialog.current?.close();
    };
    query.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previous;
      query.removeEventListener("change", closeOnDesktop);
    };
  }, [isOpen]);
  return (
    <div className={`athimart-workspace ${styles.shell}`}>
      <div className={styles.desktopSidebar}>
        <AdminSidebar displayName={displayName} email={email} />
      </div>
      <div className={styles.content}>
        <AdminHeader
          displayName={displayName}
          onMenuClick={() => {
            dialog.current?.showModal();
            setIsOpen(true);
          }}
        />
        <main className={styles.main} id="admin-content">
          {children}
        </main>
      </div>
      <dialog
        ref={dialog}
        className={styles.mobileDialog}
        aria-label="Administrator menu"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const targets = event.currentTarget.querySelectorAll<HTMLElement>(
            "a[href],button:not(:disabled)",
          );
          const first = targets[0],
            last = targets[targets.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <AdminSidebar
          displayName={displayName}
          email={email}
          onClose={() => dialog.current?.close()}
        />
      </dialog>
    </div>
  );
}
