import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";


export interface AdminShellProps {
  children: ReactNode;
  displayName: string;
  email: string;
}


export interface AdminSidebarProps {
  pathname: string;
  displayName: string;
  email: string;
}


export interface AdminHeaderProps {
  title: string;
  displayName: string;
}


export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  externalSection?: boolean;
}