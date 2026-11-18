# Wedding Invitation — implementation handoff

This ZIP is a working-source update based on the supplied 18 November 2026 project archive. It is **not a claim that every planned module is finished or production-tested**.

## Applied in this package

1. Disabled the unrestricted `/api/guests/register` public self-registration endpoint. It now returns HTTP 403 and explains that invitations must be pre-approved.
2. Replaced the public RSVP form so it submits to the existing pre-approved `/api/rsvp` endpoint using invitation code, full name and phone verification. It collects attendance, up to 10 accompanying guests, accompanying names, dietary requirements and a personal message.
3. The RSVP success state displays the QR code, opens the personal invitation route and shows the response edit token for the guest to save privately.
4. Corrected the Amharic spelling of the couple's name in the shared translation glossary to `በፀሎት እና አማኑኤል` and added translations for the specific public-page and seating labels supplied by the couple.
5. Removed the included `.env.local.backup-20261115` file because it contained a server credential. Rotate/revoke that Appwrite API key if it has ever been active or shared.
6. Removed four diagnostic screenshots identified in the review as showing private guest/owner information.
7. Expanded `.gitignore` to exclude local environment files and credential backups.

## Not completed in this ZIP — must not be treated as operational yet

- The separate Staff login, staff account provisioning, role management and Staff Dashboard.
- QR scanner, manual check-in, check-in history and supervisor exit/return passes.
- Persistent seating editor integration, editable Bridesmaids/Groomsmen tables and their dynamic chair counts. The existing seating preview is still browser-only; the API requires verification against the live Appwrite schema and `APPWRITE_SEATING_TABLE_ID`.
- The Admin Portal's unfinished pages: Website Editor, Thank-You Page, Gift Registry management, Photos & Wishes moderation, Reports, Activity Log and complete Settings.
- Guest photo/message uploads and the fully designed post-RSVP thank-you experience.
- The Guest Management 401 issue. Existing admin login code is retained; the protected endpoint still requires testing with the live Appwrite session and environment.
- Appwrite table attributes, indexes, permissions, storage buckets and production environment reconciliation.
- Full TypeScript, lint, production build, end-to-end, security, PWA and Vercel deployment tests. Dependencies were not installed in this packaging environment, so no successful build is claimed.

## Before deployment

1. Configure environment variables using a secure local `.env.local` and Vercel settings; never commit them.
2. Confirm `APPWRITE_SEATING_TABLE_ID` and all database/table/bucket IDs against the actual Appwrite project.
3. Rotate any API key that appeared in the removed backup file.
4. Run `npm ci`, `npx tsc --noEmit`, lint and `npm run build` locally.
5. Test admin login, approved guest RSVP, invitation QR, revocation, seating persistence and all role restrictions against a non-production test dataset before deployment.
