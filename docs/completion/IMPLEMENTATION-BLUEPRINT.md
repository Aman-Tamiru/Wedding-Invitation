# Wedding Invitation — Completion Blueprint

This document is the implementation contract for the remaining work. The codebase is the working baseline; do not replace the existing public design or working features while completing these modules.

## 1. Public experience
- Preserve approved couple photo, watermark, floral styling, animations, responsive layout and public navigation order: Our Celebration, Gift Registry, Our Story, The Day, Dress Code, Travel & FAQ.
- Render exactly one Staff navigation entry below Travel & FAQ. It opens `/staff/login`; do not expose staff registration.
- Use exact English couple display `Betslot & Amanuel` and exact Amharic `በፀሎት እና አማኑኤል` everywhere.
- Complete every supplied Amharic public-page translation; no English-only fallback for the specified content.
- Only pre-approved invitation records may RSVP. Public users cannot create eligible invitations.

## 2. Guest RSVP and post-registration experience
- Verify invitation code, full name and phone against a pre-created invitation record.
- Enforce invitation state, expiry/revocation and duplicate response rules on the server.
- Save RSVP and guest/companion records with a transaction-safe or compensating-write strategy.
- Issue a cryptographically random, single-purpose QR token; never expose Appwrite API keys or internal row IDs as QR credentials.
- After successful RSVP, show the approved thank-you design, the guest QR, personal invitation link, upload control for a photo and personal message, and clear privacy guidance.
- Store uploads in a private Appwrite bucket; validate MIME type, size and image decoding; authorize access by invitation token and owner/admin role.

## 3. Admin Portal
Complete and protect these owner/admin sections while retaining the existing working Seating and Guest Management pages:
1. Overview
2. Guest Management
3. Seating Arrangement
4. Website Editor
5. Thank-You Page
6. Gift Registry
7. Photos & Wishes moderation
8. Staff & Access
9. Reports
10. Activity Log
11. Settings

All write APIs must independently authenticate and authorize. Hiding links in the UI is not authorization. Owner-only actions must check `isOwner` server-side.

## 4. Staff portal and event operations
- Staff accounts are created by the owner/admin only. Each staff member has an individual username/password and explicit role/permissions.
- Staff login at `/staff/login`; dashboard at `/staff/dashboard`.
- Staff can scan QR codes and manually search guests, verify invitation status, check guests in, and see check-in history.
- On successful check-in, display the guest's assigned side, table and chair and update the shared seating view.
- Staff may view the complete seating chart read-only. Staff cannot create/edit invitations, alter RSVPs, assign/move seats, edit the website, create staff accounts or access owner settings.
- Supervisor-only exit/return passes: one active pass per guest, expiry, one-time use, cancellation, and immutable issuance/use audit records. Only explicitly authorized supervisors may issue them.

## 5. Seating Arrangement
- Persist the complete layout, tables, chair counts, guest assignments and walkway width in Appwrite; no browser-only source of truth.
- Bridesmaids and Groomsmen shared tables must be selectable/editable, allow name edits and add/remove seats, and automatically render chair positions like guest tables.
- Correct floral decoration stacking so names remain readable.
- Translate every supplied seating label into Amharic, including the couple/stage, bridesmaids/groomsmen, dance floor, DJ booth, side labels, walkway, occupancy legend and visual-preview disclaimer.
- Prevent duplicate seat assignment and enforce that only owner/admin can change seating.

## 6. Appwrite data model to confirm before migrations
Confirm the actual existing schema in the Appwrite console before creating attributes. Expected logical records:
- `wedding_invitations`: invitation_code, full_name, phone, email, status, qr_token_hash, rsvp_id, invited_by, created_at, revoked_at.
- `rsvp_responses`: invitation_id, full_name, phone, email, attending, num_guests, accompanying_names, dietary_requirements, message, edit_token_hash, created_at, updated_at.
- `admin_staff`: user_id, username, display_name, role, permissions, active, created_by.
- `wedding_seating`: record_type, layout_key, table_key, table_name, section, row_number, seat_count, seat_key, seat_number, guest_id, guest_name, sort_order, walkway_width, updated_by.
- `wedding_checkins`: invitation_id, qr_token_hash, checked_in_by, checked_in_at, status, exit_pass_id.
- `wedding_gifts`: existing fields plus enabled/order metadata as needed.
- `wedding_photos` / `wedding_wishes`: invitation_id, storage_file_id, caption/message, moderation_status, submitted_at, moderated_by.
- `wedding_activity`: actor_id, action, target_type, target_id, metadata, created_at.
- `wedding_exit_passes`: invitation_id, issued_by, issued_at, expires_at, used_at, used_by, cancelled_at, status.

Use indexes for all lookup fields and enforce uniqueness for invitation codes, QR token hashes, and active seat assignments where the Appwrite model permits. Do not assume these attributes already exist. Do not delete/rename existing tables or columns without a verified migration plan and backup.

## 7. Security requirements
- Keep `APPWRITE_API_KEY` server-only; rotate it if it was ever present in a shared backup.
- Use secure, HttpOnly, SameSite cookies; validate session and active staff record on every protected route.
- Hash sensitive one-time tokens at rest. Rate-limit login, RSVP verification, QR validation and upload endpoints.
- Validate all request bodies with schemas and enforce upload limits.
- Log privileged changes without logging passwords, session secrets, raw QR tokens or edit tokens.
- Test owner, staff, supervisor and public guest permissions independently.

## 8. Required acceptance tests
- Public user cannot create an invitation or RSVP without a pre-approved invitation.
- Valid invited guest can RSVP once; invalid name/phone/code, revoked invitation and duplicate submission are rejected.
- Guest receives a working QR and personal invitation page; QR cannot be reused after revocation or check-in.
- Guest photo/message uploads are private and can be moderated by authorized admins.
- Staff can log in, scan and manually check in; unauthorized actions return 403.
- Staff seating view is read-only; owner seating edits persist after refresh and on a second device.
- Bridesmaids/Groomsmen table edits and chair counts persist.
- All public and seating labels switch fully between English and Amharic.
- Every Admin Portal section loads, persists data where applicable and rejects unauthorized access.
- Run `npm run typecheck`, `npm run build`, automated API tests and mobile/desktop browser tests before deployment.
