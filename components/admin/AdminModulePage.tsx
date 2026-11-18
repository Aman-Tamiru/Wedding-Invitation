"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAdminLanguage } from "@/components/admin/AdminShell";

type Field = { name: string; label: string; type?: "text" | "textarea" | "email" | "number" | "url" | "date"; required?: boolean; placeholder?: string };
type ModuleConfig = { title: string; amTitle: string; description: string; amDescription: string; endpoint: string; fields?: Field[]; readOnly?: boolean; intro?: string };
type Row = Record<string, unknown>;

const inputClass = "w-full rounded-xl border border-[#e6d9d0] bg-white/90 px-4 py-3 text-sm text-[#634d50] outline-none focus:border-[#a77d86]";

export default function AdminModulePage({ config }: { config: ModuleConfig }) {
  const { language } = useAdminLanguage();
  const am = language === "am";
  const [rows, setRows] = useState<Row[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(config.endpoint, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Could not load this section (HTTP ${response.status}).`);
      const list = Array.isArray(data.items) ? data.items : Array.isArray(data.rows) ? data.rows : [];
      setRows(list as Row[]);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load this section."); }
    finally { setLoading(false); }
  }, [config.endpoint]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(config.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_or_update", ...values }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Save failed (HTTP ${response.status}).`);
      setValues({}); setNotice(am ? "በተሳካ ሁኔታ ተቀምጧል።" : "Changes saved successfully.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save changes."); }
    finally { setSaving(false); }
  }

  const display = (row: Row) => String(row.title ?? row.name ?? row.full_name ?? row.label ?? row.$id ?? "Record");

  return <div className="mx-auto max-w-[1500px] space-y-7">
    <header className="rounded-[26px] border border-[#e9d8ce] bg-gradient-to-r from-[#fffaf6] via-[#f8e9e9] to-[#f4eadc] px-6 py-7 shadow-sm sm:px-9">
      <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a17b62]">WEDDING ADMINISTRATION</p>
      <h1 className="mt-3 font-serif text-3xl text-[#754e5c] sm:text-4xl">{am ? config.amTitle : config.title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#806e68]">{am ? config.amDescription : config.description}</p>
    </header>

    {config.intro && <section className="rounded-2xl border border-[#eaded3] bg-white/80 p-5 text-sm leading-7 text-[#806e68]">{config.intro}</section>}
    {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">{error}<p className="mt-1 text-xs">{am ? "قد لا تكون واجهة API لهذا القسم قد أُنشئت بعد. سيتم توصيلها في مرحلة الخادم." : "If this is an API 404, the screen is in place but its secure Appwrite API route still needs to be implemented."}</p></div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">{notice}</div>}

    {config.fields && config.fields.length > 0 && !config.readOnly && <section className="rounded-[24px] border border-[#eaded3] bg-white/85 p-5 shadow-sm sm:p-7">
      <h2 className="font-serif text-2xl text-[#754e5c]">{am ? "ይዘት ያስገቡ" : "Create or update content"}</h2>
      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        {config.fields.map(field => <label key={field.name} className={`block space-y-2 text-sm font-medium text-[#806e68] ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
          <span>{field.label}{field.required ? " *" : ""}</span>
          {field.type === "textarea" ? <textarea required={field.required} value={values[field.name] ?? ""} onChange={e => setValues(v => ({ ...v, [field.name]: e.target.value }))} placeholder={field.placeholder} rows={4} className={inputClass} /> : <input required={field.required} type={field.type ?? "text"} value={values[field.name] ?? ""} onChange={e => setValues(v => ({ ...v, [field.name]: e.target.value }))} placeholder={field.placeholder} className={inputClass} />}
        </label>)}
        <div className="md:col-span-2"><button disabled={saving} className="rounded-full bg-[#805767] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6f4858] disabled:opacity-50">{saving ? (am ? "በማስቀመጥ ላይ..." : "Saving...") : (am ? "አስቀምጥ" : "Save changes")}</button></div>
      </form>
    </section>}

    <section className="rounded-[24px] border border-[#eaded3] bg-white/85 p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-2xl text-[#754e5c]">{am ? "የተመዘገቡ መረጃዎች" : "Records"}</h2><p className="mt-1 text-xs text-[#9a857b]">{loading ? (am ? "በመጫን ላይ..." : "Loading...") : `${rows.length} ${am ? "መዝገቦች" : "records"}`}</p></div><button onClick={() => void load()} className="rounded-full border border-[#e5d8cf] bg-white px-4 py-2 text-sm text-[#805767]">↻ {am ? "አድስ" : "Refresh"}</button></div>
      {loading ? <p className="py-12 text-center text-sm text-[#947e74]">Loading…</p> : rows.length === 0 ? <p className="py-12 text-center text-sm text-[#947e74]">{am ? "ገና ምንም መረጃ የለም።" : "No records are available yet."}</p> : <div className="mt-5 divide-y divide-[#f0e8e2]">{rows.map((row, index) => <article key={String(row.$id ?? row.id ?? index)} className="flex flex-wrap items-start justify-between gap-3 py-4"><div><h3 className="font-medium text-[#694d57]">{display(row)}</h3><p className="mt-1 max-w-3xl break-words text-xs text-[#9a857b]">{String(row.description ?? row.message ?? row.email ?? row.status ?? "")}</p></div><span className="rounded-full bg-[#f6eee9] px-3 py-1 text-xs text-[#805767]">{String(row.status ?? row.role ?? "Saved")}</span></article>)}</div>}
    </section>
  </div>;
}
