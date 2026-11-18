'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, Heart, Loader2, Ticket } from 'lucide-react';
import InvitationQRCode from '@/components/InvitationQRCode';

type RSVPResult = { qr_token: string; edit_token: string; rsvp: { full_name: string } };

export function RSVPSection() {
  const [invitationCode, setInvitationCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState(true);
  const [numGuests, setNumGuests] = useState(0);
  const [accompanyingNames, setAccompanyingNames] = useState('');
  const [dietary, setDietary] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<RSVPResult | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          invitation_code: invitationCode.trim().toUpperCase(),
          full_name: fullName.trim(), phone: phone.trim(), email: email.trim(),
          attending, num_guests: attending ? numGuests : 0,
          accompanying_names: accompanyingNames.trim(),
          dietary_requirements: dietary.trim(), message: message.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit your RSVP.');
      setResult(data as RSVPResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="rsvp" className="relative scroll-mt-20 overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 watercolor-texture" />
      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-blush-deep/30 bg-blush-light"><Heart className="h-7 w-7 text-blush-deep" fill="currentColor" /></div>
        <p className="mb-3 font-body text-xs uppercase tracking-[0.4em] text-ink-light">Will You Join Us?</p>
        <h2 className="mb-3 font-script text-4xl text-blush-deep md:text-6xl">RSVP</h2>
        <div className="mx-auto mb-8 h-px w-28 bg-gold" />
        {result ? (
          <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-ivory to-blush-light/50 p-7 shadow-lg md:p-10">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-blush-deep" />
            <h3 className="font-script text-3xl text-blush-deep">Thank you, {result.rsvp.full_name}!</h3>
            <p className="mt-3 text-sm text-ink-light">Your RSVP has been received. Keep this personal QR code private and present it at the wedding entrance.</p>
            {result.qr_token && <div className="mt-6"><InvitationQRCode token={result.qr_token} /></div>}
            <a className="mt-5 inline-flex rounded-full bg-blush-deep px-6 py-3 text-sm text-white" href={`/invitation/${result.qr_token}`}>Open My Wedding Invitation</a>
            <p className="mt-4 break-all text-xs text-ink-light">Save your response edit code securely: {result.edit_token}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 rounded-3xl border border-gold/20 bg-gradient-to-br from-ivory to-blush-light/40 p-6 text-left shadow-md md:p-10">
            <div className="text-center"><h3 className="font-serif-display text-xl text-ink">Tell us you're coming</h3><p className="mt-2 text-sm leading-relaxed text-ink-light">Only guests already added to the couple's invitation list can RSVP. Enter the invitation code you received.</p></div>
            <label className="block text-sm text-ink">Invitation Code *<input required value={invitationCode} onChange={e=>setInvitationCode(e.target.value)} maxLength={16} autoCapitalize="characters" className="form-input mt-2 w-full" placeholder="Enter your invitation code" /></label>
            <label className="block text-sm text-ink">Full Name *<input required minLength={2} value={fullName} onChange={e=>setFullName(e.target.value)} className="form-input mt-2 w-full" placeholder="Your full name" /></label>
            <div className="grid gap-5 md:grid-cols-2"><label className="block text-sm text-ink">Phone Number *<input required value={phone} onChange={e=>setPhone(e.target.value)} className="form-input mt-2 w-full" placeholder="+251 ..." /></label><label className="block text-sm text-ink">Email Address (optional)<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="form-input mt-2 w-full" placeholder="your@email.com" /></label></div>
            <label className="block text-sm text-ink">Will you attend? <select value={attending?'yes':'no'} onChange={e=>setAttending(e.target.value==='yes')} className="form-input mt-2 w-full"><option value="yes">Yes, I will attend</option><option value="no">Sorry, I cannot attend</option></select></label>
            {attending && <><label className="block text-sm text-ink">Number of accompanying guests (maximum 10)<input type="number" min={0} max={10} value={numGuests} onChange={e=>setNumGuests(Math.max(0,Math.min(10,Number(e.target.value))))} className="form-input mt-2 w-full" /></label><label className="block text-sm text-ink">Names of accompanying guests (optional)<textarea value={accompanyingNames} onChange={e=>setAccompanyingNames(e.target.value)} className="form-input mt-2 w-full" rows={2} /></label></>}
            <label className="block text-sm text-ink">Dietary requirements (optional)<textarea value={dietary} onChange={e=>setDietary(e.target.value)} className="form-input mt-2 w-full" rows={2} /></label>
            <label className="block text-sm text-ink">Personal message (optional)<textarea value={message} onChange={e=>setMessage(e.target.value)} className="form-input mt-2 w-full" rows={3} /></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-blush-deep px-6 py-4 text-sm font-semibold text-white disabled:opacity-60">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}<Ticket className="h-4 w-4" />{submitting?'Submitting...':'Register & Receive My Invitation'}</button>
            <p className="text-center text-xs text-ink-light">Your information is used for wedding guest registration and entrance management.</p>
          </form>
        )}
      </div>
    </section>
  );
}
