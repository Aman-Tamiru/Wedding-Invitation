"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/staff/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Staff sign-in failed.");
      router.replace("/staff/dashboard"); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to sign in."); }
    finally { setBusy(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f8f3ed] px-4 py-12 text-[#4f3c40]"><section className="w-full max-w-md rounded-[28px] border border-[#e9d8ce] bg-white/90 p-7 shadow-xl sm:p-9"><p className="text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a17b62]">WEDDING STAFF PORTAL</p><h1 className="mt-4 text-center font-serif text-3xl text-[#754e5c]">Betslot & Amanuel</h1><p className="mt-2 text-center text-sm text-[#806e68]">Staff Sign In</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm text-[#806e68]">Username or email<input required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e6d9d0] px-4 py-3 outline-none focus:border-[#a77d86]" /></label><label className="block text-sm text-[#806e68]">Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e6d9d0] px-4 py-3 outline-none focus:border-[#a77d86]" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-full bg-[#805767] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign In"}</button></form><p className="mt-6 text-center text-xs text-[#9a857b]">Staff accounts are created by the wedding administrators.</p><p className="mt-4 text-center text-xs"><Link href="/" className="text-[#805767] underline">Return to wedding website</Link></p></section></main>;
}
