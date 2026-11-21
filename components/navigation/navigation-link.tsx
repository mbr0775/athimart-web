"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type ComponentProps } from "react";
import { useNavigationFeedback } from "./navigation-feedback";

// onNavigate only runs for a real client-side navigation. Next still owns
// prefetching, modified clicks, downloads and external links. Keeping the
// transition at the root also survives a dropdown closing and unmounting a link.
export default function NavigationLink({ children, ref, onNavigate, ...props }: ComponentProps<typeof NextLink>) {
  const anchor = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const feedback = useNavigationFeedback();
  return <NextLink {...props} ref={node => {
    anchor.current = node;
    if (typeof ref === "function") return ref(node);
    if (ref) ref.current = node;
  }} data-navigation-link="" onNavigate={event => {
    let cancelled = false;
    onNavigate?.({ preventDefault: () => { cancelled = true; event.preventDefault(); } });
    if (cancelled || !feedback || !anchor.current) return;
    event.preventDefault();
    // Read the rendered URL so object hrefs, query strings and hashes use the
    // same resolved destination as the actual anchor.
    const url = new URL(anchor.current.href);
    const destination = `${url.pathname}${url.search}${url.hash}`;
    feedback.startNavigation(() => {
      if (props.replace) router.replace(destination, { scroll: props.scroll });
      else router.push(destination, { scroll: props.scroll });
    });
  }}>{children}</NextLink>;
}
