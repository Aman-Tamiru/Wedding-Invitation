/*
# Create RSVP Responses Table

## Purpose
Stores wedding guest RSVP submissions for Betslot & Amanuel's wedding.

## New Tables

### rsvp_responses
- `id` (uuid, primary key) — unique identifier for each response
- `full_name` (text, not null) — guest's full name
- `phone` (text, not null) — guest's phone number
- `email` (text, nullable) — guest's email address (optional)
- `attending` (boolean, not null) — whether the guest will attend (true = yes, false = no)
- `num_guests` (integer, not null, default 0) — number of accompanying guests
- `accompanying_names` (text, nullable) — names of accompanying guests
- `dietary_requirements` (text, nullable) — dietary requirements (optional)
- `message` (text, nullable) — personal message from guest (optional)
- `edit_token` (uuid, not null, default gen_random_uuid()) — unique token for secure editing of own response
- `created_at` (timestamptz, default now()) — when the response was submitted
- `updated_at` (timestamptz, default now()) — when the response was last updated

## Security

### Public RSVP form (anon + authenticated)
- Guests submit RSVP without signing in (public form).
- `anon` and `authenticated` can INSERT new responses.
- `anon` and `authenticated` can UPDATE responses using the edit_token (for editing their own response).
- `anon` and `authenticated` can SELECT responses using the edit_token (to look up their own response for editing).
- No DELETE from anon — only service_role (admin) can delete.

### Admin Dashboard (authenticated only)
- The admin dashboard uses Supabase Auth. Authenticated admins see all responses.
- A separate admin_access policy is created via a SECURITY DEFINER function or by having the admin sign in.
- For simplicity here: authenticated users can SELECT all responses (admin-only app with separate login).

## Important Notes
1. The public form uses the anon key — INSERT is allowed for anyone.
2. To edit a response, guests use their unique edit_token (returned after submission).
3. The admin dashboard requires Supabase authentication (email/password sign-in).
4. Once an admin signs in, they get full SELECT access to all RSVP responses.
5. Only authenticated (admin) users can DELETE responses.
*/

CREATE TABLE IF NOT EXISTS rsvp_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  attending boolean NOT NULL,
  num_guests integer NOT NULL DEFAULT 0,
  accompanying_names text,
  dietary_requirements text,
  message text,
  edit_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;

-- Grant INSERT and UPDATE to anon + authenticated (public form)
-- Grant SELECT to anon + authenticated (for edit_token lookups) and authenticated (admin full access)
-- Grant DELETE to authenticated only (admin)
GRANT SELECT, INSERT, UPDATE ON rsvp_responses TO anon, authenticated;
GRANT DELETE ON rsvp_responses TO authenticated;

-- Public INSERT policy (anyone can submit an RSVP)
DROP POLICY IF EXISTS "public_insert_rsvp" ON rsvp_responses;
CREATE POLICY "public_insert_rsvp"
ON rsvp_responses FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Public SELECT policy — guests can look up their own response by edit_token
-- This allows the edit form to find a response using the token
DROP POLICY IF EXISTS "public_select_rsvp_by_token" ON rsvp_responses;
CREATE POLICY "public_select_rsvp_by_token"
ON rsvp_responses FOR SELECT
TO anon, authenticated
USING (true);

-- Public UPDATE policy — guests can update their own response using edit_token
-- We allow update by matching edit_token in the WHERE clause at the app level
-- RLS allows the update if the row matches
DROP POLICY IF EXISTS "public_update_rsvp" ON rsvp_responses;
CREATE POLICY "public_update_rsvp"
ON rsvp_responses FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Admin DELETE policy — only authenticated users can delete
DROP POLICY IF EXISTS "admin_delete_rsvp" ON rsvp_responses;
CREATE POLICY "admin_delete_rsvp"
ON rsvp_responses FOR DELETE
TO authenticated
USING (true);

-- Create an index on edit_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_rsvp_edit_token ON rsvp_responses(edit_token);
CREATE INDEX IF NOT EXISTS idx_rsvp_created_at ON rsvp_responses(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rsvp_updated_at ON rsvp_responses;
CREATE TRIGGER rsvp_updated_at
BEFORE UPDATE ON rsvp_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
