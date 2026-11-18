import { NextResponse } from 'next/server';

// Public self-registration is intentionally disabled. Invitations must first be
// created by the couple or an authorized administrator in Guest Management.
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Public self-registration is closed. Please use the invitation code provided by the couple, or contact the couple if you need assistance.',
      code: 'PREAPPROVED_INVITATION_REQUIRED',
    },
    { status: 403, headers: { 'Cache-Control': 'no-store' } }
  );
}
