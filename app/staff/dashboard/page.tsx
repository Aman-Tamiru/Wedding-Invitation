
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StaffInfo = { full_name?: string; role?: string };

type Guest = {
  $id: string;
  full_name?: string;
  phone?: string;
  invitation_code?: string;
  checked_in?: boolean;
  table_name?: string;
  chair_name?: string;
  side?: string;
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: "search" | "users" | "seat" | "check" | "logout" | "sparkle" | "phone" | "ticket";
  className?: string;
}) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    seat: <><path d="M4 12V5a2 2 0 0 1 4 0v5h8V5a2 2 0 0 1 4 0v7" /><path d="M3 12h18v5H3zM5 17v4m14-4v4" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
    sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    phone: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>,
    ticket: <><path d="M2 9a3 3 0 0 0 0 6v4h20v-4a3 3 0 0 1 0-6V5H2v4Z" /><path d="M13 5v2m0 4v2m0 4v2" /></>,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function StaffDashboardPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffInfo | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/staff/me", { cache: "no-store" });

    if (response.status === 401) {
      router.replace("/staff/login");
      return;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Could not load staff account.");
    }

    setStaff(data.staff ?? data.user ?? null);
    setGuests(Array.isArray(data.guests) ? data.guests : []);
  }, [router]);

  useEffect(() => {
    void load().catch((error) =>
      setMessage(
        error instanceof Error ? error.message : "Unable to load dashboard."
      )
    );
  }, [load]);

  const filtered = guests.filter((guest) =>
    `${guest.full_name ?? ""} ${guest.phone ?? ""} ${guest.invitation_code ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const checkedInCount = guests.filter((guest) => guest.checked_in).length;

  async function checkIn(guestId: string) {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/staff/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Check-in failed.");
      }

      setMessage(data.message || "Guest check-in recorded.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Check-in failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/staff/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/staff/login");
    router.refresh();
  }

  return (
    <main className="relative min-h-screen bg-transparent px-4 pb-12 pt-7 text-[#4f3c40] sm:px-8">
      <div className="relative mx-auto max-w-6xl space-y-7">

        <header className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/55 p-6 shadow-[0_18px_55px_rgba(105,72,76,0.09)] backdrop-blur-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#ead6d6]/45 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[#a17b62]">
                <Icon name="sparkle" className="h-4 w-4" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em]">
                  Wedding Staff Portal
                </p>
              </div>

              <h1 className="font-serif text-3xl text-[#754e5c] sm:text-4xl">
                Welcome{staff?.full_name ? `, ${staff.full_name}` : ""}
              </h1>

              <p className="mt-2 text-sm text-[#806e68]">
                A warm welcome begins with a beautiful arrival.
              </p>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5d8cf]/90 bg-white/60 px-5 py-3 text-sm text-[#805767] shadow-sm backdrop-blur transition hover:bg-white"
            >
              <Icon name="logout" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[23px] border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#987c76]">Guest list</span>
              <span className="rounded-xl bg-[#f1e5df]/80 p-2 text-[#9a7180]">
                <Icon name="users" />
              </span>
            </div>
            <p className="mt-3 font-serif text-3xl text-[#754e5c]">{guests.length}</p>
            <p className="mt-1 text-xs text-[#927e73]">Guests available to staff</p>
          </div>

          <div className="rounded-[23px] border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#987c76]">Checked in</span>
              <span className="rounded-xl bg-[#e8eee5]/80 p-2 text-[#72866c]">
                <Icon name="check" />
              </span>
            </div>
            <p className="mt-3 font-serif text-3xl text-[#754e5c]">{checkedInCount}</p>
            <p className="mt-1 text-xs text-[#927e73]">Recorded arrivals</p>
          </div>

          <div className="rounded-[23px] border border-white/70 bg-white/50 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#987c76]">Your access</span>
              <span className="rounded-xl bg-[#f4eadb]/80 p-2 text-[#a17b62]">
                <Icon name="ticket" />
              </span>
            </div>
            <p className="mt-3 font-serif text-2xl text-[#754e5c]">Staff</p>
            <p className="mt-1 text-xs text-[#927e73]">Guest services and check-in</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/75 bg-white/55 p-5 shadow-[0_15px_45px_rgba(105,72,76,0.07)] backdrop-blur-2xl sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[#a17b62]">
                <Icon name="users" className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Guest services</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl text-[#754e5c]">
                Guest Check-In
              </h2>
              <p className="mt-1 text-sm text-[#806e68]">
                Find a guest and record their arrival.
              </p>
            </div>

            <span className="rounded-full border border-[#e7d9d0] bg-white/65 px-4 py-2 text-xs text-[#805767]">
              {filtered.length} results
            </span>
          </div>

          <div className="relative mt-6">
            <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a68d84]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by guest name, phone or invitation code…"
              className="w-full rounded-2xl border border-[#e6d9d0]/90 bg-white/65 py-4 pl-12 pr-4 text-sm text-[#694d57] outline-none transition placeholder:text-[#b09d95] focus:border-[#a77d86] focus:bg-white/85 focus:ring-4 focus:ring-[#b98791]/10"
            />
          </div>

          {message && (
            <p
              role="status"
              className="mt-4 rounded-2xl border border-[#eadbd2] bg-[#f7eee8]/80 p-4 text-sm text-[#805767]"
            >
              {message}
            </p>
          )}

          <div className="mt-5 space-y-3">
            {filtered.map((guest) => (
              <article
                key={guest.$id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/80 bg-white/55 p-4 transition hover:bg-white/80 hover:shadow-sm sm:p-5"
              >
                <div className="min-w-0">
                  <p className="font-serif text-lg text-[#694d57]">
                    {guest.full_name || "Unnamed guest"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#9a857b]">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="phone" className="h-3.5 w-3.5" />
                      {guest.phone || "No phone"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="ticket" className="h-3.5 w-3.5" />
                      {guest.invitation_code || "No invitation code"}
                    </span>
                  </div>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#805767]">
                    <Icon name="seat" className="h-3.5 w-3.5" />
                    {[guest.side, guest.table_name, guest.chair_name]
                      .filter(Boolean)
                      .join(" · ") || "Seating not assigned"}
                  </p>
                </div>

                <button
                  disabled={busy || guest.checked_in}
                  onClick={() => void checkIn(guest.$id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition ${
                    guest.checked_in
                      ? "border border-[#d9e4d4] bg-[#edf3e9] text-[#71856b]"
                      : "bg-[#805767] text-white hover:bg-[#704958]"
                  } disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <Icon name="check" className="h-4 w-4" />
                  {guest.checked_in ? "Checked in" : "Check in"}
                </button>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#dfcec5] bg-white/30 px-5 py-12 text-center">
                <Icon name="search" className="mx-auto h-8 w-8 text-[#b99ba0]" />
                <p className="mt-3 font-serif text-lg text-[#805767]">
                  No matching guests
                </p>
                <p className="mt-1 text-xs text-[#9a857b]">
                  Try another name, phone number or invitation code.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[28px] border border-white/75 bg-white/50 p-6 shadow-sm backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute -right-10 -bottom-16 h-44 w-44 rounded-full bg-[#e9d7d4]/35 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#a17b62]">
                <Icon name="seat" className="h-5 w-5" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
                  Guest directions
                </span>
              </div>
              <h2 className="mt-2 font-serif text-2xl text-[#754e5c]">
                Seating Chart
                <span className="ml-2 align-middle font-sans text-xs font-medium text-[#a17b62]">
                  · Read Only
                </span>
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#806e68]">
                Help guests find their assigned side, table and chair.
                Staff can view seating information but cannot change assignments.
              </p>
            </div>

            <a
              href="/api/staff/seating"
              className="inline-flex items-center gap-2 rounded-full border border-[#e4d4ca] bg-white/65 px-5 py-3 text-sm text-[#805767] transition hover:bg-white"
            >
              <Icon name="seat" className="h-4 w-4" />
              Open seating data
            </a>
          </div>
        </section>

        <footer className="pb-4 pt-2 text-center">
          <p className="font-serif text-sm italic text-[#a18483]">
            With love, from Betslot & Amanuel
          </p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-[#b19b91]">
            Thank you for being part of our celebration
          </p>
        </footer>
      </div>
    </main>
  );
}
