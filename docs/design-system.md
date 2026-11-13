# AthiMart interface styles

The storefront, customer account, authentication, delivery, seller and administrator screens share the cream and olive design defined in `app/globals.css`.

## Shared roles

Use `--background` for the cream page, `--surface` for raised form or content panels, `--surface-soft` for quiet emphasis, and `--surface-inverse` for dark navigation. `--brand` and `--brand-hover` provide primary controls; `--accent` provides restrained pale-gold details. Keep `--sale`, `--success` and `--warning` for their respective feedback states.

Use `--text`, `--text-soft` and `--text-muted` for hierarchy, and `--border` or `--border-strong` for separation. Existing `--brand-blue*` and `--brand-orange*` names are compatibility aliases to this palette; new styles should use the role names.

## Typography and controls

Bodoni Moda and Poppins font variables are attached to the root HTML element so inherited font roles resolve throughout the application. Use `font-editorial` for display text, `font-body` for interface text, or explicit font-family declarations in CSS modules. Display headings use natural case and close letter spacing; uppercase is reserved for short labels.

Shared controls use `athimart-brand-button`, `athimart-brand-outline-button`, `athimart-input`, `athimart-select` and `athimart-panel`. Keep visible focus states, 44px minimum interactive targets and reduced-motion fallbacks. Panels use the shared radius and border roles. Preserve semantic warning and error styling.

Tailwind supplies element resets in its base layer. Avoid adding unlayered element resets for heading margins, link colours or form fonts: they override utility classes across the site.

## Page patterns

- Category and product-type routes use `CollectionView` with real category photography, canonical breadcrumbs, product-type pills and the shared product card.
- Product discovery uses the editorial `ProductCard` by default, with real prices, discounts and stock.
- Administrator and seller layouts share `workspace-shell.module.css`, with server-side role guards retained in their route layouts.
- Mobile navigation uses a floating cream dock. Management navigation uses a native modal with focus handling and scroll restoration.
- Loading, missing-page and recoverable-error screens use `app/status.module.css`.
- Authentication keeps the existing motion and form behavior with the shared palette and typography.

## Verification

Use the existing `npm run build`, `npm run lint`, and `npm run test:delivery-profile` checks. Review real public pages at desktop and phone widths, and verify restricted pages in an authorized session. Isolated UI fixtures can check protected layouts and form composition without creating records; they do not replace live authorization or database-write checks.
