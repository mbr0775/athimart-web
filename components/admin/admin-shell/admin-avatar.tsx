import styles from "@/components/layout/workspace-shell.module.css";

export default function AdminAvatar({ name }: { name: string }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AM";
  return (
    <span className={styles.avatar} title={name} aria-label={name}>
      {initials}
    </span>
  );
}
