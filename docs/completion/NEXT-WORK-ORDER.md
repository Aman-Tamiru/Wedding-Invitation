# Next implementation order

1. Inspect the actual Appwrite table attributes, indexes, permissions and storage buckets; reconcile local and Vercel environment variable names.
2. Fix the admin session/Guest Management 401 using the existing login flow; add server-side authorization tests.
3. Finish approved-invitation RSVP, secure QR token lifecycle and the post-RSVP thank-you/upload flow.
4. Complete persistent seating schema/API and editable Bridesmaids/Groomsmen tables; verify staff read-only access.
5. Implement staff account provisioning, staff login, scanner, manual lookup, check-in history and supervisor exit/return passes.
6. Complete all Admin Portal modules and audit logging.
7. Finish all public/seating Amharic translations and confirm exact couple-name spelling.
8. Run typecheck/build and permission/flow tests, then prepare GitHub and Vercel deployment.

Work in complete-file replacements, preserve the approved visual design, and test each module against a non-production Appwrite dataset before deployment.
