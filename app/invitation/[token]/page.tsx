
import { notFound } from "next/navigation";
import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite-server";
import InvitationQRCode from "@/components/InvitationQRCode";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
};

type InvitationRecord = {
  $id: string;
  full_name: string;
  status: string;
  attending: boolean;
  checked_in: boolean;
};

export default async function InvitationPage({ params }: Props) {
  const { token } = await params;

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    notFound();
  }

  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const tableId = process.env.APPWRITE_INVITATIONS_TABLE_ID;

  if (!databaseId || !tableId) {
    throw new Error("Invitation database configuration is missing.");
  }

  const { tables } = createAdminClient();

  const result = await tables.listRows({
    databaseId,
    tableId,
    queries: [
      Query.equal("qr_token", token),
      Query.limit(1),
    ],
  });

  const invitation = result.rows[0] as unknown as
    | InvitationRecord
    | undefined;

  if (!invitation) {
    notFound();
  }

  if (invitation.status === "revoked") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f4ec] p-6">
        <section className="max-w-md w-full text-center bg-white p-10 rounded-2xl shadow-xl">
          <h1 className="font-serif text-3xl text-[#8d3030]">
            Invitation Deactivated
          </h1>
          <p className="mt-4 text-gray-600">
            This invitation is no longer active. Please contact the couple.
          </p>
        </section>
      </main>
    );
  }

  if (invitation.status !== "responded" || !invitation.attending) {
    notFound();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f4ec] p-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-xl">
        <p className="uppercase tracking-[0.3em] text-xs text-[#aa8954]">
          Wedding Invitation
        </p>

        <h1 className="mt-5 font-serif text-4xl text-[#44372c]">
          Betslot & Amanuel
        </h1>

        <p className="mt-5 text-lg text-gray-700">
          You are warmly invited, {invitation.full_name}.
        </p>

        <p className="mt-3 text-gray-600">
          19 November 2028 · 8:00 PM
        </p>

        <p className="mt-1 text-gray-600">
          Friendship Park · Addis Ababa, Ethiopia
        </p>

        <div className="mt-8 flex justify-center">
          <InvitationQRCode token={token} />
        </div>

        <p className="mt-5 text-sm text-gray-500">
          Please present this QR code at the entrance.
        </p>
      </section>
    </main>
  );
}
