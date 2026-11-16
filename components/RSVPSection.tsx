
'use client';

import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Heart,
  Loader2,
  Mail,
  Phone,
  Ticket,
  User,
  Users,
  ExternalLink,
} from 'lucide-react';

interface RegisteredGuest {
  full_name: string;
  invitation_url: string;
}

interface RegistrationResult {
  guests: RegisteredGuest[];
}

export function RSVPSection() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredGuests, setRegisteredGuests] = useState<
    RegisteredGuest[] | null
  >(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (
      companionName.trim() &&
      companionName.trim().toLowerCase() === fullName.trim().toLowerCase()
    ) {
      setError('The companion must have a different name.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/guests/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          companion_name: companionName.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Registration could not be completed.'
        );
      }

      if (
        !Array.isArray(result.guests) ||
        result.guests.length === 0
      ) {
        throw new Error(
          'Registration was received, but invitation links were not returned. Please contact the couple.'
        );
      }

      setRegisteredGuests(result.guests as RegisteredGuest[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFullName('');
    setPhone('');
    setEmail('');
    setCompanionName('');
    setError('');
    setRegisteredGuests(null);
  }

  return (
    <section
      id="rsvp"
      className="relative overflow-hidden py-24 md:py-32 scroll-mt-20"
    >
      <div className="absolute inset-0 watercolor-texture" />

      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-blush-deep/30 bg-blush-light">
          <Heart
            className="h-7 w-7 text-blush-deep"
            fill="currentColor"
          />
        </div>

        <p className="mb-3 font-body text-xs uppercase tracking-[0.4em] text-ink-light">
          Will You Join Us?
        </p>

        <h2 className="mb-3 font-script text-4xl text-blush-deep md:text-6xl">
          RSVP
        </h2>

        <div className="mx-auto mb-8 h-px w-28 bg-gold" />

        {registeredGuests ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gold/30 bg-gradient-to-br from-ivory to-blush-light/50 p-7 shadow-lg md:p-10"
          >
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-blush-deep/30 bg-blush-light">
              <CheckCircle2 className="h-10 w-10 text-blush-deep" />
            </div>

            <h3 className="mb-3 font-script text-3xl text-blush-deep md:text-4xl">
              Registration Successful!
            </h3>

            <p className="mb-7 font-serif-display text-lg italic text-ink">
              Thank you for registering. Your personal wedding invitation
              is ready.
            </p>

            <div className="space-y-4 text-left">
              {registeredGuests.map((guest, index) => (
                <div
                  key={`${guest.invitation_url}-${index}`}
                  className="rounded-2xl border border-gold/25 bg-white/80 p-5"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-blush-deep" />
                    <p className="font-body text-sm font-semibold text-ink">
                      {guest.full_name}
                    </p>
                  </div>

                  <p className="mb-4 text-xs leading-relaxed text-ink-light">
                    This is the personal invitation for this guest.
                    Keep the link private and present its QR code at the
                    wedding entrance.
                  </p>

                  <a
                    href={guest.invitation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blush-deep px-5 py-3 font-body text-sm text-ivory transition-colors hover:bg-blush-deep/85"
                  >
                    Open Personal Invitation
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs leading-relaxed text-ink-light">
              Each registered guest has a separate invitation and QR
              code. Please do not share your personal invitation link.
            </p>

            <button
              type="button"
              onClick={resetForm}
              className="mt-7 font-body text-sm text-blush-deep underline transition-colors hover:text-primary"
            >
              Register another guest
            </button>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-ivory to-blush-light/40 p-6 text-left shadow-md md:p-10">
            <div className="mb-7 text-center">
              <h3 className="font-serif-display text-xl text-ink">
                Tell us you're coming
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-light">
                Complete the details below to receive your personal
                wedding invitation and entrance QR code.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="guest-full-name"
                  className="mb-2 block font-body text-sm text-ink"
                >
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blush-deep" />
                  <input
                    id="guest-full-name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={200}
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    className="form-input w-full pl-11"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="guest-phone"
                    className="mb-2 block font-body text-sm text-ink"
                  >
                    Phone Number (optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blush-deep" />
                    <input
                      id="guest-phone"
                      type="tel"
                      maxLength={40}
                      autoComplete="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="+251 ..."
                      className="form-input w-full pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="guest-email"
                    className="mb-2 block font-body text-sm text-ink"
                  >
                    Email Address (optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blush-deep" />
                    <input
                      id="guest-email"
                      type="email"
                      maxLength={320}
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your@email.com"
                      className="form-input w-full pl-11"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="guest-companion"
                  className="mb-2 block font-body text-sm text-ink"
                >
                  Companion's Full Name (optional)
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blush-deep" />
                  <input
                    id="guest-companion"
                    type="text"
                    maxLength={200}
                    value={companionName}
                    onChange={(event) =>
                      setCompanionName(event.target.value)
                    }
                    placeholder="Enter your companion's full name"
                    className="form-input w-full pl-11"
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-light">
                  If you register a companion, they will receive a
                  separate invitation and entrance QR code.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-blush-deep px-6 py-4 font-body text-sm font-semibold tracking-wide text-ivory shadow-md transition-all hover:bg-blush-deep/85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    Register & Receive My Invitation
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-relaxed text-ink-light">
                Your information is used for wedding guest registration
                and entrance management.
              </p>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
