
import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, ID, Query } from '@/lib/appwrite-server';

export const runtime = 'nodejs';

const rsvpSchema = z.object({
  invitation_code: z.string().trim().max(16).optional(),
  full_name: z.string().trim().min(2).max(200),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().or(z.literal('')).optional(),
  attending: z.boolean(),
  num_guests: z.number().int().min(0).max(10),
  accompanying_names: z.string().max(2000).optional(),
  dietary_requirements: z.string().max(2000).optional(),
  message: z.string().max(5000).optional(),
});

const updateSchema = rsvpSchema.omit({ invitation_code: true });

type RSVPInput = z.infer<typeof updateSchema>;

function getDatabaseConfig() {
  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const rsvpTableId = process.env.APPWRITE_RSVP_TABLE_ID;
  const invitationsTableId = process.env.APPWRITE_INVITATIONS_TABLE_ID;

  if (!databaseId || !rsvpTableId || !invitationsTableId) {
    throw new Error('RSVP database configuration is incomplete.');
  }

  return { databaseId, rsvpTableId, invitationsTableId };
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function validToken(token: unknown): token is string {
  return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token);
}

function publicRsvp(row: Record<string, any>) {
  return {
    full_name: row.full_name,
    phone: row.phone,
    email: row.email || '',
    attending: row.attending,
    num_guests: row.num_guests || 0,
    accompanying_names: row.accompanying_names || '',
    dietary_requirements: row.dietary_requirements || '',
    message: row.message || '',
  };
}

async function findRsvpByToken(
  tables: any,
  databaseId: string,
  rsvpTableId: string,
  token: string
) {
  const result = await tables.listRows({
    databaseId,
    tableId: rsvpTableId,
    queries: [Query.equal('edit_token', token), Query.limit(1)],
  });

  return result.rows?.[0] || null;
}

async function rollbackTransaction(tables: any, transactionId: string) {
  try {
    await tables.updateTransaction({
      transactionId,
      rollback: true,
    });
  } catch {
    // A transaction that has already failed or expired may not need rollback.
  }
}

function errorResponse(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? Number((error as { code: unknown }).code)
      : 0;

  console.error('RSVP API error:', error);

  if (code === 409) {
    return NextResponse.json(
      {
        error:
          'This invitation has just been used or updated. Please refresh and try again.',
      },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { error: 'Something went wrong. Please try again later.' },
    { status: 500 }
  );
}

/**
 * GET: Retrieve an existing RSVP using its private edit token.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!validToken(token)) {
      return NextResponse.json(
        { error: 'A valid response code is required.' },
        { status: 400 }
      );
    }

    const { databaseId, rsvpTableId } = getDatabaseConfig();
    const { tables } = createAdminClient();

    const row = await findRsvpByToken(
      tables,
      databaseId,
      rsvpTableId,
      token
    );

    if (!row) {
      return NextResponse.json(
        { error: 'No response was found with that code.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ rsvp: publicRsvp(row) });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST: Create an RSVP only for an existing, preapproved invitation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Please check your RSVP details and try again.',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const invitationCode = input.invitation_code
      ?.trim()
      .toUpperCase();

    if (!invitationCode) {
      return NextResponse.json(
        { error: 'Your invitation code is required.' },
        { status: 400 }
      );
    }

    const { databaseId, rsvpTableId, invitationsTableId } =
      getDatabaseConfig();

    const { tables } = createAdminClient();

    const invitationResult = await tables.listRows({
      databaseId,
      tableId: invitationsTableId,
      queries: [
        Query.equal('invitation_code', invitationCode),
        Query.limit(1),
      ],
    });

    const invitation = invitationResult.rows?.[0];

    if (!invitation) {
      return NextResponse.json(
        {
          error:
            'We could not find that invitation code. Please check your invitation.',
        },
        { status: 404 }
      );
    }

    if (
      normalizeName(input.full_name) !==
        normalizeName(invitation.full_name || '') ||
      normalizePhone(input.phone) !==
        normalizePhone(invitation.phone || '')
    ) {
      return NextResponse.json(
        {
          error:
            'Your name or phone number does not match the invitation. Please enter the details provided by the couple.',
        },
        { status: 403 }
      );
    }

    if (invitation.status !== 'invited') {
      return NextResponse.json(
        {
          error:
            invitation.status === 'responded'
              ? 'An RSVP has already been submitted for this invitation.'
              : 'This invitation is not currently available for RSVP.',
        },
        { status: 409 }
      );
    }

    if (invitation.rsvp_id) {
      return NextResponse.json(
        {
          error:
            'An RSVP is already associated with this invitation. Please use your response code to edit it.',
        },
        { status: 409 }
      );
    }

    const editToken = randomBytes(32).toString('hex');
    const qrToken = randomBytes(32).toString('hex');
    const rsvpId = ID.unique();

    const {
      invitation_code: _invitationCode,
      ...submittedFields
    } = input;

    const rsvpData = {
      ...submittedFields,
      email: input.email || '',
      num_guests: input.attending ? input.num_guests : 0,
      accompanying_names: input.accompanying_names || '',
      dietary_requirements: input.dietary_requirements || '',
      message: input.message || '',
      edit_token: editToken,
    };

    const transaction = await tables.createTransaction();

    try {
      // Stage creation of the RSVP.
      await tables.createRow({
        databaseId,
        tableId: rsvpTableId,
        rowId: rsvpId,
        data: rsvpData,
        transactionId: transaction.$id,
      });

      // Stage the invitation claim in the same transaction.
      await tables.updateRow({
        databaseId,
        tableId: invitationsTableId,
        rowId: invitation.$id,
        data: {
          status: 'responded',
          qr_token: qrToken,
          attending: input.attending,
          num_guests: input.attending ? input.num_guests : 0,
          accompanying_names: input.accompanying_names || '',
          dietary_requirements: input.dietary_requirements || '',
          message: input.message || '',
          rsvp_id: rsvpId,
        },
        transactionId: transaction.$id,
      });

      // Both operations become permanent together.
      await tables.updateTransaction({
        transactionId: transaction.$id,
        commit: true,
      });
    } catch (error) {
      await rollbackTransaction(tables, transaction.$id);
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        edit_token: editToken,
        qr_token: qrToken,
        rsvp: publicRsvp(rsvpData),
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * PATCH: Edit an existing RSVP using its private edit token.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request.' },
        { status: 400 }
      );
    }

    const token = (body as Record<string, unknown>).edit_token;

    if (!validToken(token)) {
      return NextResponse.json(
        { error: 'A valid response code is required.' },
        { status: 400 }
      );
    }

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Please check your RSVP details and try again.',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { databaseId, rsvpTableId, invitationsTableId } =
      getDatabaseConfig();

    const { tables } = createAdminClient();

    const existing = await findRsvpByToken(
      tables,
      databaseId,
      rsvpTableId,
      token
    );

    if (!existing) {
      return NextResponse.json(
        { error: 'No response was found with that code.' },
        { status: 404 }
      );
    }

    const input: RSVPInput = parsed.data;

    const updateData = {
      ...input,
      email: input.email || '',
      num_guests: input.attending ? input.num_guests : 0,
      accompanying_names: input.accompanying_names || '',
      dietary_requirements: input.dietary_requirements || '',
      message: input.message || '',
    };

    const invitationResult = await tables.listRows({
      databaseId,
      tableId: invitationsTableId,
      queries: [
        Query.equal('rsvp_id', existing.$id),
        Query.limit(1),
      ],
    });

    const invitation = invitationResult.rows?.[0] || null;

    const transaction = await tables.createTransaction();

    try {
      await tables.updateRow({
        databaseId,
        tableId: rsvpTableId,
        rowId: existing.$id,
        data: updateData,
        transactionId: transaction.$id,
      });

      if (invitation && invitation.status === 'responded') {
        await tables.updateRow({
          databaseId,
          tableId: invitationsTableId,
          rowId: invitation.$id,
          data: {
            attending: input.attending,
            num_guests: input.attending ? input.num_guests : 0,
            accompanying_names: input.accompanying_names || '',
            dietary_requirements: input.dietary_requirements || '',
            message: input.message || '',
          },
          transactionId: transaction.$id,
        });
      }

      await tables.updateTransaction({
        transactionId: transaction.$id,
        commit: true,
      });
    } catch (error) {
      await rollbackTransaction(tables, transaction.$id);
      throw error;
    }

    return NextResponse.json({
      success: true,
      edit_token: token,
      rsvp: publicRsvp(updateData),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
