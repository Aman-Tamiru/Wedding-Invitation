'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2, Mail, Phone, User, Users, Utensils, Heart, Edit3 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { SectionReveal, FloralDivider, FloralSpray, CornerOrnament } from './FloralDecorations';

const rsvpSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  attending: z.boolean({ required_error: 'Please select yes or no' }),
  num_guests: z.number().min(0).max(10, 'Maximum 10 accompanying guests'),
  accompanying_names: z.string().optional(),
  dietary_requirements: z.string().optional(),
  message: z.string().optional(),
});

type RSVPSchema = z.infer<typeof rsvpSchema>;

interface RSVPSuccess {
  name: string;
  attending: boolean;
  editToken: string;
}

export function RSVPSection() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<RSVPSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editTokenInput, setEditTokenInput] = useState('');
  const [editData, setEditData] = useState<RSVPSchema | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RSVPSchema>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      attending: undefined,
      num_guests: 0,
      accompanying_names: '',
      dietary_requirements: '',
      message: '',
    },
  });

  const attending = watch('attending');

  const onSubmit = async (data: RSVPSchema) => {
    setSubmitting(true);
    setError(null);

    try {
      if (editMode && editData) {
        // Update existing response
        const { error: updateError } = await supabase
          .from('rsvp_responses')
          .update({
            full_name: data.full_name,
            phone: data.phone,
            email: data.email || null,
            attending: data.attending,
            num_guests: data.num_guests,
            accompanying_names: data.accompanying_names || null,
            dietary_requirements: data.dietary_requirements || null,
            message: data.message || null,
          })
          .eq('edit_token', editTokenInput);

        if (updateError) throw updateError;

        setSuccess({
          name: data.full_name,
          attending: data.attending,
          editToken: editTokenInput,
        });
        setEditMode(false);
        setEditData(null);
        reset();
      } else {
        // Insert new response
        const { data: insertData, error: insertError } = await supabase
          .from('rsvp_responses')
          .insert({
            full_name: data.full_name,
            phone: data.phone,
            email: data.email || null,
            attending: data.attending,
            num_guests: data.attending ? data.num_guests : 0,
            accompanying_names: data.accompanying_names || null,
            dietary_requirements: data.dietary_requirements || null,
            message: data.message || null,
          })
          .select('edit_token')
          .single();

        if (insertError) throw insertError;

        setSuccess({
          name: data.full_name,
          attending: data.attending,
          editToken: insertData.edit_token,
        });
        reset();
      }
    } catch (err) {
      setError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLookup = async () => {
    if (!editTokenInput.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const { data, error: lookupError } = await supabase
        .from('rsvp_responses')
        .select('*')
        .eq('edit_token', editTokenInput.trim())
        .maybeSingle();

      if (lookupError) throw lookupError;
      if (!data) {
        setError('No response found with that code. Please check and try again.');
        return;
      }

      setEditMode(true);
      setEditData(data);
      setValue('full_name', data.full_name);
      setValue('phone', data.phone);
      setValue('email', data.email || '');
      setValue('attending', data.attending);
      setValue('num_guests', data.num_guests);
      setValue('accompanying_names', data.accompanying_names || '');
      setValue('dietary_requirements', data.dietary_requirements || '');
      setValue('message', data.message || '');
    } catch {
      setError('Could not find your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setEditMode(false);
    setEditData(null);
    setEditTokenInput('');
    setError(null);
    reset();
  };

  return (
    <SectionReveal
      id="rsvp"
      className="relative py-24 md:py-32 overflow-hidden scroll-mt-20"
    >
      <div className="absolute inset-0 watercolor-texture" />
      <FloralSpray className="absolute top-8 left-0 w-32 h-32 opacity-50" />
      <FloralSpray className="absolute bottom-8 right-0 w-32 h-32 opacity-50" flip />

      <div ref={sectionRef} className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blush-light border border-blush-deep/30 mb-6">
          <Heart className="w-7 h-7 text-blush-deep" fill="currentColor" />
        </div>

        <p className="font-body text-xs tracking-[0.4em] uppercase text-ink-light mb-3">
          Will You Join Us?
        </p>
        <h2 className="font-script text-4xl md:text-6xl text-blush-deep mb-2">
          RSVP
        </h2>
        <FloralDivider className="mb-8" />

        <AnimatePresence mode="wait">
          {/* Success state */}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-gradient-to-br from-ivory to-blush-light/50 rounded-3xl p-8 md:p-12 border border-gold/30 shadow-lg"
            >
              <CornerOrnament className="absolute -top-3 -left-3 w-12 h-12 opacity-70" />
              <CornerOrnament className="absolute -top-3 -right-3 w-12 h-12 opacity-70" flip />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 rounded-full bg-blush-light border-2 border-blush-deep/30 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-blush-deep" />
              </motion.div>

              <h3 className="font-script text-3xl md:text-4xl text-blush-deep mb-3">
                Thank You, {success.name.split(' ')[0]}!
              </h3>
              <p className="font-serif-display text-lg text-ink italic mb-6">
                {success.attending
                  ? 'We can\'t wait to celebrate with you!'
                  : 'We\'ll miss you, but thank you for letting us know.'}
              </p>

              <div className="bg-blush-light/50 rounded-xl p-4 mb-6 text-left">
                <p className="font-body text-xs text-ink-light mb-1 tracking-wider uppercase">
                  Your Response Code
                </p>
                <p className="font-mono text-sm text-ink break-all">{success.editToken}</p>
                <p className="font-body text-xs text-ink-light mt-2">
                  Save this code to edit your response later.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="font-body text-sm text-blush-deep hover:text-primary transition-colors underline"
              >
                Submit another response
              </button>
            </motion.div>
          )}

          {/* Form state */}
          {!success && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative bg-gradient-to-br from-ivory to-blush-light/40 rounded-3xl p-6 md:p-10 border border-gold/20 shadow-md text-left"
            >
              {/* Edit mode toggle */}
              {!editMode && (
                <div className="mb-6 flex items-center justify-between">
                  <p className="font-serif-display text-lg text-ink">
                    {editData ? 'Edit Your Response' : 'Tell us if you can make it'}
                  </p>
                  <button
                    onClick={() => {
                      setEditMode(!editMode);
                      if (!editMode) {
                        setEditData(null);
                        reset();
                      }
                    }}
                    className="flex items-center gap-1.5 font-body text-xs text-blush-deep hover:text-primary transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {editMode ? 'Cancel edit' : 'Edit existing'}
                  </button>
                </div>
              )}

              {/* Edit token lookup */}
              {editMode && !editData && (
                <div className="mb-6">
                  <label className="block font-body text-sm text-ink mb-2">
                    Enter your response code to edit
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editTokenInput}
                      onChange={(e) => setEditTokenInput(e.target.value)}
                      placeholder="Paste your code here..."
                      className="flex-1 rounded-lg border border-blush-deep/30 bg-ivory px-4 py-2.5 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-blush-deep/30"
                    />
                    <button
                      onClick={handleEditLookup}
                      disabled={submitting || !editTokenInput.trim()}
                      className="px-5 py-2.5 rounded-lg bg-blush-deep text-ivory font-body text-sm disabled:opacity-50 hover:bg-blush-deep/85 transition-colors"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              {(!editMode || editData) && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <FormField label="Full Name" icon={<User className="w-4 h-4" />} error={errors.full_name?.message}>
                    <input
                      {...register('full_name')}
                      type="text"
                      placeholder="Your full name"
                      className="form-input"
                    />
                  </FormField>

                  <div className="grid md:grid-cols-2 gap-5">
                    <FormField label="Phone Number" icon={<Phone className="w-4 h-4" />} error={errors.phone?.message}>
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="+251 ..."
                        className="form-input"
                      />
                    </FormField>

                    <FormField label="Email (optional)" icon={<Mail className="w-4 h-4" />} error={errors.email?.message}>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="your@email.com"
                        className="form-input"
                      />
                    </FormField>
                  </div>

                  {/* Attending */}
                  <FormField label="Will you attend?" error={errors.attending?.message}>
                    <div className="grid grid-cols-2 gap-3">
                      <AttendingButton
                        selected={attending === true}
                        onClick={() => setValue('attending', true, { shouldValidate: true })}
                        label="Yes, I'll be there"
                        variant="yes"
                      />
                      <AttendingButton
                        selected={attending === false}
                        onClick={() => setValue('attending', false, { shouldValidate: true })}
                        label="Can't make it"
                        variant="no"
                      />
                    </div>
                  </FormField>

                  {/* Conditional fields for attending guests */}
                  {attending === true && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5 overflow-hidden"
                    >
                      <FormField
                        label="Number of accompanying guests"
                        icon={<Users className="w-4 h-4" />}
                        error={errors.num_guests?.message}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setValue('num_guests', Math.max(0, (watch('num_guests') || 0) - 1))}
                            className="w-10 h-10 rounded-full bg-blush-deep/10 text-blush-deep font-serif-display text-xl flex items-center justify-center hover:bg-blush-deep/20 transition-colors"
                          >
                            −
                          </button>
                          <span className="font-serif-display text-2xl text-ink w-8 text-center">
                            {watch('num_guests') || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => setValue('num_guests', Math.min(10, (watch('num_guests') || 0) + 1))}
                            className="w-10 h-10 rounded-full bg-blush-deep/10 text-blush-deep font-serif-display text-xl flex items-center justify-center hover:bg-blush-deep/20 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </FormField>

                      {watch('num_guests') && watch('num_guests')! > 0 && (
                        <FormField label="Names of accompanying guests">
                          <textarea
                            {...register('accompanying_names')}
                            rows={2}
                            placeholder="List their names here..."
                            className="form-input resize-none"
                          />
                        </FormField>
                      )}

                      <FormField
                        label="Dietary requirements (optional)"
                        icon={<Utensils className="w-4 h-4" />}
                      >
                        <input
                          {...register('dietary_requirements')}
                          type="text"
                          placeholder="e.g., vegetarian, gluten-free, allergies..."
                          className="form-input"
                        />
                      </FormField>
                    </motion.div>
                  )}

                  <FormField label="Personal message (optional)">
                    <textarea
                      {...register('message')}
                      rows={3}
                      placeholder="Share your wishes with the couple..."
                      className="form-input resize-none"
                    />
                  </FormField>

                  {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                      <p className="font-body text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-blush-deep to-blush-deep/85 text-ivory font-body text-sm tracking-[0.2em] uppercase shadow-lg disabled:opacity-60 hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : editMode ? (
                      'Update Response'
                    ) : (
                      'Send RSVP'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        :global(.form-input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--blush-deep) / 0.3);
          background-color: hsl(var(--ivory));
          padding: 0.625rem 1rem;
          font-family: var(--font-montserrat), sans-serif;
          font-size: 0.875rem;
          color: hsl(var(--ink));
          transition: box-shadow 0.2s, border-color 0.2s;
        }
        :global(.form-input:focus) {
          outline: none;
          border-color: hsl(var(--blush-deep) / 0.5);
          box-shadow: 0 0 0 2px hsl(var(--blush-deep) / 0.2);
        }
        :global(.form-input::placeholder) {
          color: hsl(var(--ink-light) / 0.5);
        }
      `}</style>
    </SectionReveal>
  );
}

function FormField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 font-body text-sm text-ink mb-1.5">
        {icon && <span className="text-blush-deep">{icon}</span>}
        {label}
      </label>
      {children}
      {error && <p className="mt-1 font-body text-xs text-red-500">{error}</p>}
    </div>
  );
}

function AttendingButton({
  selected,
  onClick,
  label,
  variant,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  variant: 'yes' | 'no';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3.5 rounded-xl border-2 font-body text-sm transition-all ${
        selected
          ? variant === 'yes'
            ? 'bg-blush-deep text-ivory border-blush-deep shadow-md'
            : 'bg-ink/80 text-ivory border-ink shadow-md'
          : 'bg-ivory text-ink border-blush-deep/20 hover:border-blush-deep/40'
      }`}
    >
      {label}
    </button>
  );
}
