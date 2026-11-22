# Hover, press and navigation feedback

The user's preference is explicit: clickable buttons and labels should feel responsive, and opening a feature or screen must not leave an unexplained 2-3 second pause. Apply this within the UI being built or changed; do not expand a narrow task into an unrelated site-wide redesign.

## Control states

- Give actionable buttons, text links, navigation labels, tabs, menu items and clickable feature cards a visible hover treatment. Use a consistent brand-colored background/border change, underline, icon shift or subtle lift. Choose a restrained combination rather than stacking every effect. Plain headings, form labels and disabled controls should not suggest an action they do not support.
- Provide visible `focus-visible` styling for keyboard users and pressed feedback on activation. Hover is a pointer state; click/tap and keyboard activation need their own response. Persistent selected/current states must remain distinguishable from hover.
- Prefer shared component variants and motion tokens. Around 120-180ms for hover transitions and 80-120ms for press transitions are starting points, not mandatory delays. Limit transitions to intended properties; avoid layout movement, shifting text, and blanket `transition: all`.
- Scope hover transforms to hover-capable pointers. Keep labels and hit areas usable on touch screens. Respect reduced motion using static color, border and focus cues without removing loading/status information.

## Screen and feature transitions

- Acknowledge activation on the next available paint, aiming for perceptible feedback within roughly 100ms. Set pending state before awaiting navigation/data. Do not wait for the request to complete before showing the loader. Keep synchronous work short so it does not prevent the feedback from painting.
- Use one coherent pattern for the scope: a slim top progress indicator for route transitions while the current page remains usable; a layout-matched skeleton for destination content; or an inline spinner and short status on the activated control for a local async action. Prefer stable app chrome over a full-screen blocking overlay. Avoid redundant simultaneous loaders.
- Connect pending UI to the actual router, framework transition, or request lifecycle. Cover navigation through menus, feature cards, tabs and programmatic routes where affected; a loader wired only to one click handler can miss other entry points. Use existing framework loading boundaries and navigation primitives where available.
- Show pending feedback throughout a genuine multi-second wait. End it when the destination is usable or the local operation finishes, and clear it on failure, cancellation, or superseding navigation. Guard against stale completions hiding a newer operation's indicator. Do not introduce artificial delays, simulated progress percentages or minimum-duration splash screens. Cached or instant navigation should complete without an unnecessary loading flash.
- Preserve native link behavior, including modified clicks and opening a new tab. Prevent duplicate submissions for mutations; do not disable the whole interface or block valid alternate navigation. Mark the affected region busy and expose a concise accessible status without repeated announcements. Maintain sensible focus on arrival.
- Keep recoverable content visible on failure and provide a useful error/retry path. A loader must never become an endless substitute for failure handling.

## Address the underlying delay

Inspect the affected path before choosing an optimization: request waterfalls, unnecessary refetches, delayed route imports, heavy initial rendering and main-thread work can require different fixes. Where appropriate, use route prefetching, caching, code splitting or parallel independent requests within the existing architecture. Preserve data freshness and authorization. Loading feedback improves perceived responsiveness; it does not establish that navigation became faster.

## Verify behavior

Exercise an affected navigation with a genuine or development-controlled 2-3 second wait. Confirm that feedback appears before completion, remains during the wait and resolves into the destination without layout jumps. Also check instant/cached completion, request failure with retry, rapid repeated activation, a second navigation during pending work, and back/forward behavior where affected. Check keyboard activation, touch without hover and reduced motion. If runtime access is unavailable, report these checks as unverified; editing a skill does not fix an existing site's navigation.
