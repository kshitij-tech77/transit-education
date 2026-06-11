'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useContest } from './ContestProvider';
import { AVATAR_COLORS, QUALIFICATION_OPTIONS, type AuthStep } from '@/types/contest';

// ── Schemas ──────────────────────────────────────────────────────────────────
const emailSchema = z.object({ email: z.string().email('Enter a valid email') });
const profileSchema = z.object({
  display_name: z.string().min(1, 'Name is required').max(50),
  city: z.string().min(1, 'City is required').max(100),
  qualification: z.enum(['SEE/SLC', '+2/A-Levels', "Bachelor's", "Master's", 'Other']),
  favourite_team: z.string().max(100).optional(),
  avatar_color: z.string(),
});

type EmailForm = z.infer<typeof emailSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

// ── Confetti ─────────────────────────────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: -(Math.random() * 300 + 50),
    rotate: Math.random() * 720,
    color: ['#fbbf24', '#2563eb', '#10b981', '#ef4444', '#8b5cf6'][i % 5],
    size: Math.random() * 6 + 4,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {active && particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: '50%',
            top: '50%',
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotate, opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ── OTP Input ─────────────────────────────────────────────────────────────────
function OtpInput({
  onComplete,
  onResend,
  email,
  isLoading,
}: {
  onComplete: (code: string) => void;
  onResend: () => void;
  email: string;
  isLoading: boolean;
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const full = newDigits.join('');
    if (full.length === 6 && newDigits.every(d => d !== '')) {
      onComplete(full);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const arr = pasted.split('');
      setDigits(arr);
      inputRefs.current[5]?.focus();
      onComplete(pasted);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <p className="text-sm text-[#9ca3af]">
          Sent to <span className="text-white font-medium">{email}</span>
        </p>
        <p className="text-xs text-[#6b7280] mt-1">Valid for 10 minutes</p>
      </div>

      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            disabled={isLoading}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border bg-[#0a0e1a] text-white outline-none transition-all
              disabled:opacity-50
              ${d ? 'border-[#2563eb]' : 'border-[#1f2937]'}
              focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30`}
          />
        ))}
      </div>

      {error && <p className="text-sm text-[#ef4444] text-center">{error}</p>}

      <button
        type="button"
        disabled={resendCooldown > 0}
        onClick={() => { onResend(); setResendCooldown(60); setDigits(['', '', '', '', '', '']); }}
        className="text-sm text-center disabled:text-[#4b5563] text-[#2563eb] hover:text-[#60a5fa] disabled:cursor-not-allowed transition-colors"
      >
        {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
      </button>
    </div>
  );
}

// ── Main AuthModal ────────────────────────────────────────────────────────────
export default function AuthModal() {
  const { showAuthModal, authModalClose, setUser, refreshUser } = useContest();
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmailState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { avatar_color: AVATAR_COLORS[0] },
  });

  // Reset when modal closes
  useEffect(() => {
    if (!showAuthModal) {
      setStep('email');
      setError('');
      emailForm.reset();
      profileForm.reset({ avatar_color: AVATAR_COLORS[0] });
      setSelectedColor(AVATAR_COLORS[0]);
    }
  }, [showAuthModal, emailForm, profileForm]);

  const sendOtp = useCallback(async (values: EmailForm) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contest/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setEmailState(values.email);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contest/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      setUser(data.user);
      if (data.isNewUser || !data.user.profile_complete) {
        setStep('profile');
        if (data.user.display_name) {
          profileForm.setValue('display_name', data.user.display_name);
        }
      } else {
        setShowConfetti(true);
        setTimeout(() => { setShowConfetti(false); authModalClose(); }, 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  }, [email, setUser, authModalClose, profileForm]);

  const submitProfile = useCallback(async (values: ProfileForm) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contest/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, avatar_color: selectedColor }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      setUser(data.user);
      await refreshUser();
      setShowConfetti(true);
      setTimeout(() => { setShowConfetti(false); authModalClose(); }, 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  }, [selectedColor, setUser, authModalClose, refreshUser]);

  const STEP_LABELS: Record<AuthStep, string> = {
    email: 'Sign in to Predict',
    otp: 'Verify Your Email',
    profile: 'Complete Your Profile',
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={authModalClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal — bottom sheet on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:pointer-events-none"
          >
            <div className="relative bg-[#111827] rounded-t-3xl md:rounded-2xl md:pointer-events-auto md:w-full md:max-w-md border border-[#1f2937] overflow-hidden">
              <Confetti active={showConfetti} />

              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-10 h-1 rounded-full bg-[#374151]" />
              </div>

              {/* Header */}
              <div className="px-6 pt-4 pb-5 border-b border-[#1f2937]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚽</span>
                    <div>
                      <h2 className="text-lg font-bold text-white">{STEP_LABELS[step]}</h2>
                      <p className="text-xs text-[#6b7280]">FIFA World Cup 2026 · Transit Education</p>
                    </div>
                  </div>
                  <button
                    onClick={authModalClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1f2937] hover:bg-[#374151] transition-colors text-[#9ca3af] hover:text-white"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Step indicators */}
                <div className="flex gap-1.5 mt-4">
                  {(['email', 'otp', 'profile'] as AuthStep[]).map((s, i) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= (['email', 'otp', 'profile'] as AuthStep[]).indexOf(step)
                          ? 'bg-[#2563eb]'
                          : 'bg-[#1f2937]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                <AnimatePresence mode="wait">

                  {/* Step 1: Email */}
                  {step === 'email' && (
                    <motion.div
                      key="email"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <form onSubmit={emailForm.handleSubmit(sendOtp)} className="flex flex-col gap-4">
                        <p className="text-sm text-[#9ca3af]">
                          No password needed — we'll send a 6-digit verification code.
                        </p>
                        <div>
                          <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 uppercase tracking-wider">
                            Email address
                          </label>
                          <input
                            {...emailForm.register('email')}
                            type="email"
                            placeholder="you@example.com"
                            autoFocus
                            disabled={isLoading}
                            className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-xl px-4 py-3 text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/30 transition disabled:opacity-50"
                          />
                          {emailForm.formState.errors.email && (
                            <p className="text-xs text-[#ef4444] mt-1">
                              {emailForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                        {error && <p className="text-sm text-[#ef4444]">{error}</p>}
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors"
                        >
                          {isLoading ? 'Sending…' : 'Send verification code →'}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {/* Step 2: OTP */}
                  {step === 'otp' && (
                    <motion.div
                      key="otp"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <OtpInput
                        email={email}
                        isLoading={isLoading}
                        onComplete={verifyOtp}
                        onResend={() => sendOtp({ email })}
                      />
                      {error && <p className="text-sm text-[#ef4444] text-center mt-4">{error}</p>}
                      {isLoading && (
                        <p className="text-sm text-[#9ca3af] text-center mt-4 animate-pulse">
                          Verifying…
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Profile */}
                  {step === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <form onSubmit={profileForm.handleSubmit(submitProfile)} className="flex flex-col gap-4">
                        <p className="text-sm text-[#9ca3af]">
                          Tell us a bit about yourself to appear on the leaderboard.
                        </p>

                        {/* Display name */}
                        <div>
                          <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 uppercase tracking-wider">
                            Display name *
                          </label>
                          <input
                            {...profileForm.register('display_name')}
                            placeholder="Your name on the leaderboard"
                            disabled={isLoading}
                            className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-xl px-4 py-3 text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#2563eb] transition disabled:opacity-50"
                          />
                          {profileForm.formState.errors.display_name && (
                            <p className="text-xs text-[#ef4444] mt-1">
                              {profileForm.formState.errors.display_name.message}
                            </p>
                          )}
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 uppercase tracking-wider">
                            City *
                          </label>
                          <input
                            {...profileForm.register('city')}
                            placeholder="Your city (e.g. Kathmandu)"
                            disabled={isLoading}
                            className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-xl px-4 py-3 text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#2563eb] transition disabled:opacity-50"
                          />
                          {profileForm.formState.errors.city && (
                            <p className="text-xs text-[#ef4444] mt-1">
                              {profileForm.formState.errors.city.message}
                            </p>
                          )}
                        </div>

                        {/* Qualification */}
                        <div>
                          <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 uppercase tracking-wider">
                            Qualification *
                          </label>
                          <select
                            {...profileForm.register('qualification')}
                            disabled={isLoading}
                            className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#2563eb] transition disabled:opacity-50 appearance-none"
                          >
                            <option value="">Select qualification</option>
                            {QUALIFICATION_OPTIONS.map(q => (
                              <option key={q} value={q}>{q}</option>
                            ))}
                          </select>
                          {profileForm.formState.errors.qualification && (
                            <p className="text-xs text-[#ef4444] mt-1">
                              Please select your qualification
                            </p>
                          )}
                        </div>

                        {/* Favourite team */}
                        <div>
                          <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 uppercase tracking-wider">
                            Favourite team (optional)
                          </label>
                          <input
                            {...profileForm.register('favourite_team')}
                            placeholder="e.g. Brazil, Argentina, Nepal…"
                            disabled={isLoading}
                            className="w-full bg-[#0a0e1a] border border-[#1f2937] rounded-xl px-4 py-3 text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#2563eb] transition disabled:opacity-50"
                          />
                        </div>

                        {/* Avatar color */}
                        <div>
                          <label className="block text-xs font-medium text-[#9ca3af] mb-2 uppercase tracking-wider">
                            Avatar colour
                          </label>
                          <div className="flex gap-2.5">
                            {AVATAR_COLORS.map(color => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => {
                                  setSelectedColor(color);
                                  profileForm.setValue('avatar_color', color);
                                }}
                                className={`w-9 h-9 rounded-full transition-all ${
                                  selectedColor === color
                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111827] scale-110'
                                    : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {error && <p className="text-sm text-[#ef4444]">{error}</p>}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors mt-2"
                        >
                          {isLoading ? 'Saving…' : '🏆 Complete profile & start predicting'}
                        </button>
                      </form>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
