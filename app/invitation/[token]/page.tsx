
import { notFound } from "next/navigation";
import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite-server";
import { CoupleWatermarks } from "@/components/CoupleWatermarks";
import GuestInvitationExperience from "@/components/guest/GuestInvitationExperience";


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
  accompanying_names?: string;
};

export default async function InvitationPage({ params }: Props) {
  const { token } = await params;

  if (!/^[a-f0-9]{64}$/i.test(token)) notFound();

  const databaseId = process.env.APPWRITE_DATABASE_ID;
  const tableId = process.env.APPWRITE_INVITATIONS_TABLE_ID;

  if (!databaseId || !tableId) {
    throw new Error("Invitation database configuration is missing.");
  }

  const { tables } = createAdminClient();

  const result = await tables.listRows({
    databaseId,
    tableId,
    queries: [Query.equal("qr_token", token), Query.limit(1)],
  });

  const invitation = result.rows[0] as unknown as InvitationRecord | undefined;

  if (!invitation) notFound();

  if (invitation.status === "revoked") {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="guest-glass-panel max-w-lg p-10 text-center">
          <h1 className="font-serif text-3xl text-[#805767]">Invitation Deactivated · ግብዣው ተሰርዟል</h1>
          <p className="mt-4">Please contact the couple · እባክዎ ከጥንዶቹ ጋር ይገናኙ።</p>
        </div>
      </main>
    );
  }

  if (invitation.status !== "responded" || !invitation.attending) notFound();

  const partnerName = invitation.accompanying_names
    ?.split(/\r?\n|,/)
    .map((name) => name.trim())
    .filter(Boolean)[0];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        <CoupleWatermarks />
      </div>
      <div className="relative z-10">
        <GuestInvitationExperience
          token={token}
          guestName={invitation.full_name}
          checkedIn={Boolean(invitation.checked_in)}
          partnerName={partnerName}
        />
      </div>
    </main>
  );
}
