---
name: wix-inspired-web-studio
description: Create or redesign premium, original websites from Wix-style reference links or screenshots, with art direction, production frontend code, and visual QA.
---

# Wix Inspired Web Studio

Turn a user's website-template references into an **original, functioning, polished** site in the current project's tech stack. This skill is for UI/UX design and implementation, not for transferring Wix themes or reproducing proprietary source code.

## When to use

Use this workflow when the user:
- shares Wix (or comparable) website-template links and asks to make a site look that polished;
- asks for a portfolio, SaaS signup page, coming-soon page, hospitality/real-estate website, or welcoming service/booking site inspired by premium templates;
- requests a redesign of an existing website where visual fidelity, clear conversion goals, and functioning code matter.

When a user explicitly asks for the `$premium-frontend-design`, `$reference-to-code`, or `$cinematic-web-motion` skill too, compose with those only when appropriate. This skill does not require them.

## Required process

1. **Inspect project before editing.** Identify framework, pages/routes, existing component library, tokens, assets, design conventions, tests, and functional dependencies. Inspect `AGENTS.md` and other project instructions, if any. Preserve existing code architecture when practical.
2. **Inspect provided references.** If website/browser access exists, visit desktop and mobile previews and capture screenshots for comparison. Separate observed elements (typography, imagery, hierarchy, color, spacing, interactions) from uncertain assumptions. If a site is not accessible, use the reference notes in `references/wix-design-directions.md` and any supplied images; never pretend to have inspected inaccessible content. Ask for a screenshot only if crucial fidelity details are missing and the task cannot proceed sensibly.
3. **Select an art direction.** Read `references/wix-design-directions.md`. Choose ONE primary design direction based on the site's purpose, then selectively borrow secondary patterns. Do not merge unrelated visual styles into a chaotic page. If an established brand design system exists, preserve or deliberately evolve it instead of replacing it with the reference brand.
4. **Plan the screen.** State a compact page/section map and visual plan: headline hierarchy, grid, whitespace, imagery, color and type tokens, interactive states, page-level conversion goal, mobile behaviors. Decide which components already exist and which must be created.
5. **Implement production-grade UI code.** Use the project's existing framework (Next.js/React/Tailwind, plain HTML/CSS, etc.) rather than switching stacks without approval. Use components and semantic HTML, meaningful data structures and accessible controls. Wire up real behaviors; do not present fake signups, booking successes, carts or forms. Preserve routes, API integration, authorization, data shape, and business logic. Build responsiveness at small and large viewports.
6. **Make interactions respond immediately.** Read `references/interaction-feedback.md` when creating or changing interactive UI. Give clickable buttons, text links, navigation labels, tabs and feature cards consistent hover, keyboard-focus and pressed feedback. Screen and feature navigation must visibly acknowledge activation immediately and show real pending feedback during waits, including the reported 2-3 second delay. Use a restrained progress indicator, local loader or destination skeleton suited to the scope. Diagnose and reduce the delay as well. Decorative reveals, parallax and 3D remain optional. Prefer CSS for simple effects; heavier motion libraries only when justified. Respect reduced motion, touch input and loading budgets.
7. **Review the actual output.** Build or typecheck as available, run existing tests, inspect rendered pages at mobile/tablet/desktop if browser tools are available, and correct visible issues. Use the checklist in `references/quality-gates.md`. If tools prevent visual inspection, say so; do not claim screenshots were checked.
8. **Report concisely.** Summarize art direction chosen, files changed, implemented behaviors, checks run, and remaining limitations. If modifying an existing repo, do not commit, push, deploy or replace assets unless requested.

## Design quality standard

- Premium presentation = coherent art direction, strong type, intentional whitespace, tailored image treatment, clear hierarchy, and satisfying detail; **not** automatically more animation or cards.
- Above-the-fold content should communicate the brand, value proposition, and primary action. Avoid generic headings like “Welcome to our website” unless provided by the user.
- Use real, appropriately licensed/user-supplied images or transparent placeholders clearly labeled pending replacement. Never invent product testimonials, ratings, awards or metrics.
- Create original implementations **inspired by** layout principles. Do not copy copyrighted template assets, logos, proprietary source, branding or entire page compositions verbatim.
- Match existing project functionality. Treat visual changes as improvements to the interface, not a license to remove features.
- Avoid bulky dependencies, scroll-jacking, impossible hover-only controls, inaccessible text over imagery, massive mobile hero sections and animation that blocks interaction.
- Existing brand consistency, user constraints and explicit requests take precedence over reference stylistic details.

## Profile picture across the website

For sites with user accounts, show the signed-in user's profile picture on every page, including Home, Settings, profile, dashboard and feature screens, on desktop and mobile. Put the avatar in the shared header, sidebar or equivalent persistent account area so individual routes cannot accidentally omit it. Keep it visible in the mobile layout, not solely inside a closed menu. This preference does not require adding accounts to a site without them.

- Use a reusable avatar component connected to the existing shared user/profile state and persisted profile image. Avoid page-specific hardcoded images or separate profile fetches for each avatar.
- A successful photo change or removal in Settings must propagate to every avatar without a page reload and persist after refresh and a new session. Refresh the relevant state/cache after saving; avoid stale browser image caches when the image URL is reused. Keep an unsaved preview distinct from the saved profile, and retain the previous image if saving fails.
- Use consistent cropping, shape and sizing appropriate to each placement. Reserve image dimensions, retain the current image during background refresh, and use initials or a neutral account icon when a photo is missing or fails to load. Give an interactive avatar an accessible account/profile action name and the same hover, focus and pressed feedback as other controls.
- Clear user-specific avatar state on logout/account switching so another user's photo cannot remain visible. Signed-out visitors use the site's existing sign-in or guest presentation.

Verify visibility on Home, Settings and all shared-layout route groups, including direct links, refresh and mobile navigation. Check photo update/removal, failed save, missing/broken images and account switching. Report runtime checks as unverified when only editing this skill.

## Templates and examples

Read `references/wix-design-directions.md` whenever choosing a reference style; read `references/interaction-feedback.md` when implementing controls or navigation and `references/quality-gates.md` before declaring completion. For example prompts and integration suggestions, see `references/example-prompts.md`.

## Completion criteria

A successful result is an ORIGINAL website/page rendered in the existing project, with cohesive design inspired by the selected reference, usable interactive elements, sensible mobile layouts, no known functionality regression, and transparent verification status. A skill instruction file by itself is not implementation of the user's website.
