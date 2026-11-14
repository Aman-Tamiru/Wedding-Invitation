/*
# Create Admin Staff Table

## Purpose
Tracks which authenticated users are authorized admin staff for the wedding dashboard.
The owner admin can add additional staff accounts.

## New Tables

### admin_staff
- `id` (uuid, primary key) — unique identifier
- `user_id` (uuid, not null, references auth.users) — the Supabase auth user ID
- `email` (text, not null) — the admin's email
- `full_name` (text, not null) — admin's display name
- `role` (text, not null, default 'staff') — 'owner' or 'staff'
- `created_at` (timestamptz, default now())

## Security
- Only authenticated users can read the admin_staff table (to check if they're an admin).
- Users can only see their own admin_staff row (not other admins' details).
- INSERT is restricted: only existing owners can add new staff. This is handled via a SECURITY DEFINER function.
- The admin dashboard checks if the signed-in user has a row in admin_staff.

## Important Notes
1. The owner admin is added manually via SQL or a one-time setup function.
2. Additional staff are added by the owner through the dashboard (using a SECURITY DEFINER function that runs as the owner).
3. The dashboard verifies admin status by checking if auth.uid() has a row in admin_staff.
*/

CREATE TABLE IF NOT EXISTS admin_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_staff ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT their own admin_staff row
GRANT SELECT ON admin_staff TO authenticated;

DROP POLICY IF EXISTS "admin_select_own_row" ON admin_staff;
CREATE POLICY "admin_select_own_row"
ON admin_staff FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Owners can SELECT all admin_staff rows (to see the staff list)
DROP POLICY IF EXISTS "owner_select_all_staff" ON admin_staff;
CREATE POLICY "owner_select_all_staff"
ON admin_staff FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_staff a
    WHERE a.user_id = auth.uid() AND a.role = 'owner'
  )
);

-- Owners can INSERT new staff rows
DROP POLICY IF EXISTS "owner_insert_staff" ON admin_staff;
CREATE POLICY "owner_insert_staff"
ON admin_staff FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_staff a
    WHERE a.user_id = auth.uid() AND a.role = 'owner'
  )
);

-- Owners can DELETE staff rows
DROP POLICY IF EXISTS "owner_delete_staff" ON admin_staff;
CREATE POLICY "owner_delete_staff"
ON admin_staff FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_staff a
    WHERE a.user_id = auth.uid() AND a.role = 'owner'
  )
);

-- Owners can UPDATE staff rows (e.g., change role)
DROP POLICY IF EXISTS "owner_update_staff" ON admin_staff;
CREATE POLICY "owner_update_staff"
ON admin_staff FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_staff a
    WHERE a.user_id = auth.uid() AND a.role = 'owner'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_staff a
    WHERE a.user_id = auth.uid() AND a.role = 'owner'
  )
);

-- Grant service_role access for edge functions if needed
GRANT ALL ON admin_staff TO service_role;
