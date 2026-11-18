
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminLanguage } from "@/components/admin/AdminShell";

type GuestRow = {
  $id: string;
  invitation_code?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  status?: string;
  attending?: string | boolean;
  num_guests?: number | string;
  accompanying_names?: string;
  dietary_requirements?: string;
  message?: string;
  created_at?: string;
  [key: string]: unknown;
};

type Guest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  invitationCode: string;
  invitationStatus: string;
  attending: string;
  guests: number;
  message: string;
};

function normalize(value: unknown): string {
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (value === null || value === undefined) return "";
  return String(value);
}

function attendanceLabel(value: unknown): string {
  const normalized = normalize(value).toLowerCase();

  if (["yes", "true", "attending", "1"].includes(normalized)) {
    return "Attending";
  }

  if (["no", "false", "not attending", "declined", "0"].includes(normalized)) {
    return "Not attending";
  }

  return normalized ? normalize(value) : "No response";
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function GuestManagementPage() {
  const { language } = useAdminLanguage();
  const am = language === "am";

  const [invitations, setInvitations] = useState<GuestRow[]>([]);
  const [responses, setResponses] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadGuests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/guests", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load guest records.");
      }

      setInvitations(Array.isArray(data.invitations) ? data.invitations : []);
      setResponses(Array.isArray(data.responses) ? data.responses : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGuests();
  }, [loadGuests]);

  const guests = useMemo<Guest[]>(() => {
    const responseByCode = new Map<string, GuestRow>();

    for (const response of responses) {
      const code = normalize(response.invitation_code);
      if (code) responseByCode.set(code, response);
    }

    return invitations.map((invitation) => {
      const code = normalize(invitation.invitation_code);
      const rsvp = responseByCode.get(code);

      return {
        id: invitation.$id,
        name: normalize(rsvp?.full_name || invitation.full_name) || "Unnamed guest",
        phone: normalize(rsvp?.phone || invitation.phone),
        email: normalize(rsvp?.email || invitation.email),
        invitationCode: code,
        invitationStatus: normalize(invitation.status) || "invited",
        attending: rsvp
          ? attendanceLabel(rsvp.attending)
          : "No response",
        guests: Number(rsvp?.num_guests ?? 0) || 0,
        message: normalize(rsvp?.message),
      };
    });
  }, [invitations, responses]);

  const filteredGuests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesSearch =
        !term ||
        guest.name.toLowerCase().includes(term) ||
        guest.phone.toLowerCase().includes(term) ||
        guest.email.toLowerCase().includes(term) ||
        guest.invitationCode.toLowerCase().includes(term);

      const matchesFilter =
        filter === "all" ||
        (filter === "attending" && guest.attending === "Attending") ||
        (filter === "declined" && guest.attending === "Not attending") ||
        (filter === "pending" && guest.attending === "No response");

      return matchesSearch && matchesFilter;
    });
  }, [guests, search, filter]);

  const attendingCount = guests.filter(
    (guest) => guest.attending === "Attending"
  ).length;

  const declinedCount = guests.filter(
    (guest) => guest.attending === "Not attending"
  ).length;

  const pendingCount = guests.filter(
    (guest) => guest.attending === "No response"
  ).length;

  function exportCsv() {
    const headings = [
      "Guest Name",
      "Phone",
      "Email",
      "Invitation Code",
      "Invitation Status",
      "Attendance",
      "Additional Guests",
    ];

    const rows = filteredGuests.map((guest) => [
      guest.name,
      guest.phone,
      guest.email,
      guest.invitationCode,
      guest.invitationStatus,
      guest.attending,
      String(guest.guests),
    ]);

    const csv = [
      headings,
      ...rows,
    ]
      .map((row) => row.map((value) => escapeCsv(String(value))).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-guests.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const statCards = [
    {
      label: am ? "ጠቅላላ እንግዶች" : "Total Invitations",
      value: guests.length,
    },
    {
      label: am ? "የሚመጡ" : "Attending",
      value: attendingCount,
    },
    {
      label: am ? "የማይመጡ" : "Not Attending",
      value: declinedCount,
    },
    {
      label: am ? "ምላሽ ያልሰጡ" : "Awaiting Response",
      value: pendingCount,
    },
  ];

  return (
    <div className="mx-auto max-w-[1450px] space-y-7">
      <header className="rounded-[28px] border border-[#e9d8ce] bg-gradient-to-br from-[#fffaf6] via-[#f8e9e9] to-[#f2e8dc] px-6 py-8 shadow-sm sm:px-9">
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a17b62]">
          {am ? "የእንግዶች አስተዳደር" : "WEDDING ADMINISTRATION"}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl text-[#754e5c] sm:text-4xl">
              {am ? "የእንግዶች ዝርዝር" : "Guest Management"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#806e68]">
              {am
                ? "ግብዣዎችን፣ የRSVP ምላሾችን እና የመገኘት ሁኔታን ይመልከቱ።"
                : "View approved invitations, RSVP responses and guest attendance in one place."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadGuests}
              disabled={loading}
              className="rounded-full border border-[#c9a99e] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#805767] transition hover:bg-white disabled:opacity-50"
            >
              {loading ? (am ? "በመጫን ላይ..." : "Loading...") : (am ? "አድስ ↻" : "Refresh ↻")}
            </button>
            <button
              onClick={exportCsv}
              disabled={filteredGuests.length === 0}
              className="rounded-full bg-[#805767] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#704958] disabled:opacity-50"
            >
              {am ? "CSV አውርድ ↓" : "Export CSV ↓"}
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[22px] border border-[#eaded3] bg-white/85 p-5 shadow-sm"
          >
            <p className="text-xs text-[#947e74]">{card.label}</p>
            <p className="mt-3 font-serif text-4xl text-[#805767]">
              {loading ? "—" : card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-[26px] border border-[#eaded3] bg-white/85 p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-[#754e5c]">
              {am ? "የተመዘገቡ እንግዶች" : "Guest Directory"}
            </h2>
            <p className="mt-1 text-xs text-[#9a857b]">
              {am
                ? `${filteredGuests.length} እንግዶች ታይተዋል`
                : `Showing ${filteredGuests.length} of ${guests.length} invitations`}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={am ? "በስም፣ ስልክ ወይም ኮድ ፈልግ..." : "Search name, phone, email or code..."}
              className="min-w-0 rounded-full border border-[#e5d8cf] bg-[#fffdfb] px-5 py-3 text-sm text-[#634d50] outline-none transition placeholder:text-[#b2a19a] focus:border-[#b58d91] sm:w-[310px]"
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-full border border-[#e5d8cf] bg-[#fffdfb] px-4 py-3 text-sm text-[#634d50] outline-none focus:border-[#b58d91]"
            >
              <option value="all">{am ? "ሁሉም እንግዶች" : "All guests"}</option>
              <option value="attending">{am ? "የሚመጡ" : "Attending"}</option>
              <option value="declined">{am ? "የማይመጡ" : "Not attending"}</option>
              <option value="pending">{am ? "ምላሽ ያልሰጡ" : "Awaiting response"}</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-[#947e74]">
            {am ? "የእንግዶች መረጃ በመጫን ላይ..." : "Loading guest records..."}
          </div>
        ) : !error && filteredGuests.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-xl text-[#805767]">
              {am ? "እንግዶች አልተገኙም" : "No guests found"}
            </p>
            <p className="mt-2 text-sm text-[#9a857b]">
              {am ? "የፍለጋ ቃልዎን ይቀይሩ።" : "Try changing your search or filter."}
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#eaded3] text-[10px] uppercase tracking-[0.15em] text-[#a18b80]">
                  <th className="px-3 py-4 font-semibold">Guest</th>
                  <th className="px-3 py-4 font-semibold">Contact</th>
                  <th className="px-3 py-4 font-semibold">Invitation</th>
                  <th className="px-3 py-4 font-semibold">RSVP</th>
                  <th className="px-3 py-4 text-center font-semibold">Extra Guests</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-[#f0e8e2] transition hover:bg-[#fffaf7]"
                  >
                    <td className="px-3 py-4">
                      <p className="font-medium text-[#694d57]">{guest.name}</p>
                      <p className="mt-1 text-xs text-[#a18b80]">{guest.email || "—"}</p>
                    </td>
                    <td className="px-3 py-4 text-sm text-[#806e68]">
                      {guest.phone || "—"}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-mono text-xs text-[#806e68]">
                        {guest.invitationCode || "—"}
                      </p>
                      <p className="mt-1 text-[10px] capitalize text-[#a18b80]">
                        {guest.invitationStatus}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                          guest.attending === "Attending"
                            ? "bg-green-50 text-green-700"
                            : guest.attending === "Not attending"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {guest.attending}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center text-sm text-[#806e68]">
                      {guest.guests}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
