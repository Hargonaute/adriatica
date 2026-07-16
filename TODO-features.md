# TODO — Features to Implement (DELETE WHEN DONE)

---

## ✅ 1. Three New Page Builder Blocks

### 1a. Button Block
- New file: `src/components/page-builder/blocks/button/ButtonBlock.tsx`
- Export `ButtonEditor` + `ButtonPreview`, register in `registry.ts` under key `'button'`
- Editor fields: label, URL, variant (primary / outline / ghost), icon (none / arrow / external / download), align (left / center / right), open in new tab toggle
- Preview: renders `<a>` with inline styles (no Tailwind), same style map as `DownloadButtonPreview` in `DownloadButtonBlock.tsx`
- Add `ButtonBlockData` to `src/types.ts`
- Icon: `MousePointerClick` from lucide-react (already imported in registry)

### 1b. Contact Form Block — Form + Image Only (no info cards)
- There is already a `contact-form` block (`ContactFormBlock.tsx`) that renders the full contact page including `<ContactInfoSection>` (the three info cards) + `<ContactSection>` (form + image).
- Create a **new block** `'contact-form-simple'` in `src/components/page-builder/blocks/contact-form-simple/ContactFormSimpleBlock.tsx`
- Preview: render **only** `<ContactSection>` — the form + side image — without `<ContactInfoSection>` (no cards on top)
- Editor fields: heading, body text, side image URL (same as existing contact-form editor but without the cards)
- Register in `registry.ts` under key `'contact-form-simple'`, label "Contact Form (Simple)"
- Add `ContactFormSimpleBlockData` to `src/types.ts`

### 1c. Catalogue Download Block
- There is already a `download-button` block, but this is a **full section** block (red background, heading + image + download button) — wrapping the existing `<CatalogueSection>` component from `src/components/home/CatalogueSection.tsx`
- New file: `src/components/page-builder/blocks/catalogue/CatalogueBlock.tsx`
- The download link is hardcoded in `CatalogueSection.tsx` as `href="/Adriatica Final Catalogue.pdf"` — keep this same link
- Editor fields: heading, CTA label, catalogue image URL, image alt
- Preview: reuse `<CatalogueSection>` directly
- Register in `registry.ts` under key `'catalogue'`, label "Catalogue Download"
- Add `CatalogueBlockData` to `src/types.ts`

---

## 2. Legal Pages — Terms & Conditions + Privacy Policy

- Create two new static routes under `src/app/(site)/[locale]/[slug]/staticRoutes.tsx` OR as separate page files
- Pages needed:
  - `/[locale]/legal/terms` — Terms & Conditions
  - `/[locale]/legal/privacy` — Privacy Policy
- Content can be minimal placeholder text initially
- Both pages should use the existing `<Navbar>` + `<SiteFooter>` (already in `layout.tsx`)
- Link them in `SiteFooter` component (`src/components/home/SiteFooter.tsx`) — add a "Legal" section or inline links

---

## 3. Cookie Consent Banner

- New client component: `src/components/shared/CookieConsent.tsx`
- Behavior:
  - Shown on first visit if no `cookie_consent` value in `localStorage`
  - Dismisses on "Accept" or "Decline" — saves choice to `localStorage`
  - Should NOT block page content (fixed bottom bar, not modal)
  - On "Accept": set `localStorage.cookie_consent = 'accepted'`; fire GA consent update (see item 5)
  - On "Decline": set `localStorage.cookie_consent = 'declined'`; do NOT fire analytics
- Mount in `src/app/(site)/layout.tsx` (the outer site layout, not the locale layout), so it appears on all public pages
- Inline styles only (no Tailwind) — consistent with site renderer output rules

---

## 4. Resend Integration — Contact Form Email Notifications

- Install: `npm install resend`
- API route: `src/app/api/contact/route.ts` (or wire into the existing form submission endpoint `src/app/api/entries/create/route.ts` as a side-effect after successful entry insert)
- On contact form submit: after saving entry to DB, send email via Resend to the configured recipient
- Environment variables needed (add to `.env.local` and Vercel env):
  - `RESEND_API_KEY` — Resend API key
  - `CONTACT_EMAIL_TO` — recipient address (e.g. `contact@adriatica.ma`)
  - `CONTACT_EMAIL_FROM` — sender address (must be a verified Resend domain, e.g. `no-reply@adriatica.ma`)
- Email content: include all form fields submitted (name, email, message, phone, etc.)
- Only trigger for the `contact` collection — check `collectionSlug === 'contact'` before sending
- Handle Resend errors gracefully — log but don't fail the form submission if email sending fails

---

## 5. Google Analytics (GA4) Integration

- Install: `npm install @next/third-parties` (already available in Next.js 14+ as a first-party package)
- Add `<GoogleAnalytics gaId="G-XXXXXXXXXX" />` in `src/app/layout.tsx` (root layout, applies to all routes)
- Environment variable: `NEXT_PUBLIC_GA_ID` — GA4 measurement ID
- Cookie consent gating:
  - Load GA in `denied` consent mode by default (so the script loads but does not track)
  - On cookie acceptance (from `CookieConsent.tsx` in item 3), call `gtag('consent', 'update', { analytics_storage: 'granted' })`
  - On decline, keep `analytics_storage: 'denied'`
- This requires initialising gtag with `window.dataLayer` consent defaults BEFORE `GoogleAnalytics` fires — add an inline `<script>` in `<head>` in `src/app/layout.tsx` that sets default consent state to `denied`
- Reference: https://developers.google.com/tag-platform/devguides/consent

---

## Notes

- Cookie consent (item 3) and GA consent mode (item 5) must be implemented together — they are tightly coupled
- The `contact-form` block (existing) should remain unchanged; the new `contact-form-simple` (item 1b) is additive
- After all blocks are implemented, run `npx tsc --noEmit` to verify no type errors
- Delete this file once all items are checked off
