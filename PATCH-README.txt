Wedding Invitation patch — 15 November 2026

Copy the folders in this ZIP into the project root, preserving folder structure and overwriting these files:
- app/manifest.ts
- lib/translations.ts
- components/Footer.tsx

Changes:
1. Fixes Next.js manifest icon purpose typing by using separate any and maskable icon entries.
2. Removes duplicate translation keys defensively and adds missing Amharic strings reported, including RSVP labels, travel copy, countdown units, and Ethiopian-calendar wedding date.
3. Changes the footer Admin link to render only after /api/admin/me confirms an authenticated owner. Staff and public guests do not see it. The owner can still open /admin directly to sign in.

Important: This patch does not yet implement a complete content-management system. The current dashboard in the supplied source manages RSVP guests and staff; it does not yet edit every public page section. That requires a persistent content store and corresponding owner-only CRUD UI/API.
