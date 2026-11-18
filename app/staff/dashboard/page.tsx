"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type StaffInfo = { full_name?: string; role?: string };
type Guest = { $id: string; full_name?: string; phone?: string; invitation_code?: string; checked_in?: boolean; table_name?: string; chair_name?: string; side?: string };

export default function StaffDashboardPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffInfo | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/staff/me", { cache: "no-store" });
    if (response.status === 401) { router.replace("/staff/login"); return; }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not load staff account.");
    setStaff(data.staff ?? data.user ?? null); setGuests(Array.isArray(data.guests) ? data.guests : []);
  }, [router]);

  useEffect(() => { void load().catch(e => setMessage(e instanceof Error ? e.message : "Unable to load dashboard.")); }, [load]);

  const filtered = guests.filter(g => `${g.full_name ?? ""} ${g.phone ?? ""} ${g.invitation_code ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  async function checkIn(guestId: string) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/staff/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ guestId }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Check-in failed.");
      setMessage(data.message || "Guest check-in recorded."); await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Check-in failed."); }
    finally { setBusy(false); }
  }
  async function logout() {
    await fetch("/api/staff/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/staff/login"); router.refresh();
  }

  return <main className="min-h-screen bg-[#f8f3ed] px-4 py-8 text-[#4f3c40] sm:px-8"><div className="mx-auto max-w-6xl space-y-6"><header className="flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-[#e9d8ce] bg-white/90 p-6"><div><p className="text-[10px] uppercase tracking-[0.3em] text-[#a17b62]">WEDDING STAFF PORTAL</p><h1 className="mt-2 font-serif text-3xl text-[#754e5c]">Welcome{staff?.full_name ? `, ${staff.full_name}` : ""}</h1><p className="mt-1 text-sm text-[#806e68]">Guest check-in and seating lookup</p></div><button onClick={logout} className="rounded-full border border-[#e5d8cf] px-5 py-2 text-sm text-[#805767]">Sign out</button></header>
    <section className="rounded-[24px] border border-[#eaded3] bg-white/90 p-5"><h2 className="font-serif text-2xl text-[#754e5c]">Guest Check-In</h2><p className="mt-1 text-sm text-[#806e68]">Search by guest name, phone number or invitation code. Seating information is read-only for staff.</p><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search guests…" className="mt-5 w-full rounded-xl border border-[#e6d9d0] px-4 py-3 text-sm outline-none focus:border-[#a77d86]" />{message && <p role="status" className="mt-4 rounded-xl bg-[#f7eee8] p-3 text-sm text-[#805767]">{message}</p>}<div className="mt-5 divide-y divide-[#f0e8e2]">{filtered.map(g=><article key={g.$id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><p className="font-medium text-[#694d57]">{g.full_name || "Unnamed guest"}</p><p className="mt-1 text-xs text-[#9a857b]">{g.phone || "—"} · {g.invitation_code || "—"}</p><p className="mt-1 text-xs text-[#805767]">{[g.side,g.table_name,g.chair_name].filter(Boolean).join(" · ") || "Seating not assigned"}</p></div><button disabled={busy || g.checked_in} onClick={()=>void checkIn(g.$id)} className="rounded-full bg-[#805767] px-5 py-2 text-sm text-white disabled:opacity-40">{g.checked_in ? "Checked in" : "Check in"}</button></article>)}{filtered.length===0 && <p className="py-10 text-center text-sm text-[#9a857b]">No matching guests.</p>}</div></section>
    <section className="rounded-[24px] border border-[#eaded3] bg-white/90 p-5"><h2 className="font-serif text-xl text-[#754e5c]">Seating Chart · Read Only</h2><p className="mt-2 text-sm text-[#806e68]">Staff may view assigned seating and occupancy but cannot assign, move or edit seats.</p><a href="/api/staff/seating" className="mt-3 inline-block text-sm text-[#805767] underline">Open seating data</a></section></div></main>;
}
