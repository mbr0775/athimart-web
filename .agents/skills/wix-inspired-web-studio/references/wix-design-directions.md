# Wix design directions: reference catalog

These are **source-backed high-level descriptions** of the named Wix templates (checked 2026-10-11), plus separately identified design suggestions. The actual rendered visual details may vary; when accurate replication of layout language matters, inspect the live desktop/mobile preview and/or screenshots before building.

## 1. 3D Designer — visual-first creative portfolio
- Original: https://www.wix.com/website-template/view/html/1919
- Wix positioning: motion graphics designers, art directors and creative portfolios. Sleek, clean, expansive; customization for designs, animations, photos, text, and video presentations.
- Suggested original UI approach: dramatic editorial art direction, gallery-first project showcase, oversized display typography, large canvas-like hero, restrained UI framing, high-quality video/media blocks, optional spatial parallax. Dark/neutral surfaces with an accent palette **only when compatible with user's brand**.
- Best for: technology agencies, design studios, software product showcases and a creative TokiloTech landing page.
- Guardrail: images/3D scenes must be owned, licensed, or newly created; do not reuse sample designer assets.

## 2. Signup LP (Simple) — conversion-first landing page
- Original: https://www.wix.com/website-template/view/html/wh-1453
- Wix positioning: landing pages, sign-up pages, marketing campaigns; clean design with prominently explained benefits and sign-up CTA.
- Suggested original UI approach: minimal navigation, focused hero value proposition, credible benefits, lightweight proof, short accessible signup form, inline validation and success/error states connected to real API or clearly marked demo.
- Best for: app waiting lists, SaaS introductions, new product acquisition campaigns; e.g., Lankar or Apzo.
- Guardrail: do not store email addresses in an unprotected or misleading setup.

## 3. Coming Soon LP (Tranquil) — quiet launch anticipation
- Original: https://www.wix.com/website-template/view/html/wh-1105
- Wix positioning: startups, product launches, events, services; serene coming-soon page.
- Suggested original UI approach: soft colors, intentional negative space, atmospheric/organic imagery, a short launch message, one accessible email notification flow, restrained entrance transitions, mobile-first composition.
- Best for: new product launches, limited-release sites, prelaunch offerings.
- Guardrail: don't invent a launch date, countdown or subscriber count.

## 4. Urban Apartment (Pastel) — photography-led hospitality
- Original: https://www.wix.com/website-template/view/html/wh-1300
- Wix positioning: urban apartments, short-term rental, real estate and hospitality; chic pastel design and welcoming atmosphere.
- Suggested original UI approach: beautiful environmental photography, thoughtful editorial grid, airy pastel panels, generous whitespace, room/property highlights, amenities, gallery, inquiries or booking path; balance welcoming tone and practical information.
- Best for: Genza hospitality/tourism, short stays, hotels, travel listings and property sites.
- Guardrail: do not fake available rooms, prices, address or booking slots; connect to real data.

## 5. Therapy Services (Balanced) — warm trust-based services
- Original: https://www.wix.com/website-template/view/html/wh-1104
- Wix positioning: therapy, counseling, wellness; services, testimonials and Wix Bookings integration for appointment scheduling.
- Suggested original UI approach: welcoming palette, inviting type, human-centered imagery, readable service explanations, trust cues from real business details, accessible intake/contact forms, clear appointment flow.
- Best for: Fixoom service providers, wellness/services, client booking websites and professional consultancies.
- Guardrail: testimonials must be genuine; don't claim medical treatment, credentials or real availability without verification.

## Style selection matrix

| User goal | Primary reference | Secondary concepts to borrow |
| --- | --- | --- |
| 3D agency, modern tech showcase, motion portfolio | 3D Designer | focused CTA from Signup LP |
| App launch or feature waitlist | Signup LP (Simple) | serene atmosphere from Coming Soon |
| Unreleased startup/product | Coming Soon (Tranquil) | signup usability from Signup LP |
| Rental, hotel, travel, property | Urban Apartment (Pastel) | approachable contact/service flow from Therapy Services |
| Booking, personal services, professional care | Therapy Services (Balanced) | editorial photo layout from Urban Apartment |

## Translating references into implementation

Observe: global composition; hero treatment; typography scale; accent color; foreground/background contrast; spacing rhythm; section cadence; image aspect ratios; text density; navigation clarity; scrolling transitions; hover/keyboard/touch states; mobile hierarchy.

Then translate: site goals > page map > component inventory > design tokens > desktop and mobile structure > functional UI > purposeful motion > rendered visual QA. If the user's site belongs to a different industry, translate *principles*, not example copy or business-specific assumptions.

These links are **inspiration references**, not templates purchased/licensed by the user. Do not reproduce proprietary theme code or template visual assets.
