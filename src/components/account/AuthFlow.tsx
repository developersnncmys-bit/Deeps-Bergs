"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TbLoader2, TbArrowLeft, TbEye, TbEyeOff } from "react-icons/tb";
import {
  requestOtp,
  verifyOtp,
  signInEmail,
  signUpEmail,
  signInSocial,
  isAuthError,
} from "@/lib/auth";

type Method = "mobile" | "email";
type OtpStage = "phone" | "code";

const RESEND_SECONDS = 30;

export function AuthFlow() {
  // Single unified flow — same entry point for sign in and sign up.
  const [method, setMethod] = useState<Method>("mobile");
  const [otpStage, setOtpStage] = useState<OtpStage>("phone");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Mobile
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // When sign-in reports ACCOUNT_NOT_FOUND we offer to create the account
  // in place using the same email + password, so the user doesn't have to
  // swap modes or retype.
  const [notFound, setNotFound] = useState(false);

  const startResendCountdown = () => {
    setResendIn(RESEND_SECONDS);
    if (resendTimer.current) clearInterval(resendTimer.current);
    resendTimer.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          if (resendTimer.current) clearInterval(resendTimer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const onSendOtp = async () => {
    setError(null);
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length !== 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setBusy(true);
    try {
      await requestOtp(`+91${normalized}`);
      setOtpStage("code");
      startResendCountdown();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onVerifyOtp = async () => {
    setError(null);
    setBusy(true);
    try {
      const normalized = phone.replace(/\D/g, "");
      await verifyOtp(`+91${normalized}`, code);
      // Modal will show the success screen and close on its own once useAuth
      // reports the signed-in user.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotFound(false);
    setBusy(true);
    try {
      await signInEmail(email, password);
      // Modal will show the success screen and close on its own once useAuth
      // reports the signed-in user.
    } catch (err) {
      if (isAuthError(err) && err.code === "ACCOUNT_NOT_FOUND") {
        // Don't surface as a hard error — offer to create the account instead.
        setNotFound(true);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  };

  const onCreateAccountInline = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUpEmail(email, password);
      // Modal will show the success screen and close on its own once useAuth
      // reports the signed-in user.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onSocial = async (provider: "google" | "apple") => {
    setError(null);
    setBusy(true);
    try {
      await signInSocial(provider);
      // Modal will show the success screen and close on its own once useAuth
      // reports the signed-in user.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid w-full lg:h-[620px] lg:grid-cols-2">
        {/* ── Left: lifestyle image (no overlay copy) ── */}
        <div className="relative hidden lg:block lg:h-full">
          <Image
            src="/images/chapterv1.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 0px"
            priority
            className="object-cover"
          />
        </div>

        {/* ── Right: form ── */}
        <div className="flex flex-col items-center overflow-y-auto px-6 py-8 sm:px-10 sm:py-10 lg:h-full">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center">
            <Image
              src="/logov6.png"
              alt="Deeps & Bergs"
              width={160}
              height={55}
              className="h-10 w-auto"
              priority
            />
          </div>

          <div className="w-full max-w-sm">
            <h1
              style={{ fontFamily: "var(--font-raleway)" }}
              className="text-center text-2xl font-medium text-ink sm:text-[28px]"
            >
              Sign in / Sign up
            </h1>
            <p className="mt-2 text-center text-sm text-ink-muted">
              {method === "mobile" && otpStage === "phone"
                ? "Enter your mobile number to continue"
                : method === "mobile"
                  ? `OTP sent to +91 ${phone}`
                  : "Enter your email to continue"}
            </p>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {/* ── Mobile OTP ── */}
            {method === "mobile" && otpStage === "phone" && (
              <div className="mt-8 flex flex-col gap-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    Mobile number
                  </label>
                  <div className="flex items-stretch border border-line bg-white focus-within:border-ink">
                    <span className="flex items-center gap-2 border-r border-line bg-white px-3 text-sm text-ink">
                      <IndiaFlag />
                      <span className="text-xs font-semibold">+91</span>
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter mobile number"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-ink outline-none placeholder:text-ink-subtle"
                    />
                  </div>
                </div>
                <PrimaryButton onClick={onSendOtp} busy={busy}>
                  Continue
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className="text-center text-xs font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  Use email instead
                </button>
              </div>
            )}

            {method === "mobile" && otpStage === "code" && (
              <div className="mt-8 flex flex-col gap-5">
                <button
                  type="button"
                  onClick={() => {
                    setOtpStage("phone");
                    setCode("");
                  }}
                  className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-ink-muted hover:text-ink"
                >
                  <TbArrowLeft size={14} />
                  Change number
                </button>
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    6-digit code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="● ● ● ● ● ●"
                    className="w-full border border-line bg-white px-3 py-3.5 text-center text-lg font-semibold tracking-[0.5em] text-ink outline-none focus:border-ink"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-ink-muted">
                    <span>
                      {resendIn > 0
                        ? `Resend in ${resendIn}s`
                        : "Didn't receive it?"}
                    </span>
                    <button
                      type="button"
                      disabled={resendIn > 0 || busy}
                      onClick={onSendOtp}
                      className="font-semibold text-brand-dark underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-ink-subtle disabled:no-underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
                <PrimaryButton onClick={onVerifyOtp} busy={busy}>
                  Verify &amp; Continue
                </PrimaryButton>
              </div>
            )}

            {/* ── Email ── */}
            {method === "email" && (
              <form onSubmit={onEmailSubmit} className="mt-8 flex flex-col gap-5">
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(v) => {
                    setEmail(v);
                    setNotFound(false);
                  }}
                  autoComplete="email"
                  placeholder="you@example.com"
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-ink">
                    Password
                  </label>
                  <div className="relative flex items-stretch border border-line bg-white focus-within:border-ink">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="Your password"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-ink outline-none placeholder:text-ink-subtle"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="flex items-center justify-center px-3 text-ink-muted transition-colors hover:text-ink"
                    >
                      {showPassword ? <TbEyeOff size={18} /> : <TbEye size={18} />}
                    </button>
                  </div>
                </div>

                {notFound ? (
                  <div className="rounded-md border border-ink/10 bg-[#fafafa] p-4 text-sm">
                    <p className="text-ink">
                      We couldn&apos;t find an account for{" "}
                      <span className="font-semibold">{email}</span>.
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Create one with the email and password above?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={onCreateAccountInline}
                        disabled={busy}
                        style={{ fontFamily: "var(--font-raleway)" }}
                        className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/60"
                      >
                        {busy && <TbLoader2 size={14} className="animate-spin" />}
                        Create account
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotFound(false)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
                      >
                        Use another email
                      </button>
                    </div>
                  </div>
                ) : (
                  <PrimaryButton type="submit" busy={busy}>
                    Continue
                  </PrimaryButton>
                )}

                <button
                  type="button"
                  onClick={() => setMethod("mobile")}
                  className="text-center text-xs font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                >
                  Use mobile instead
                </button>
              </form>
            )}

            {/* Divider + social */}
            <div className="mt-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-ink-muted">
              <span className="h-px flex-1 bg-line" />
              or continue with
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <SocialButton
                onClick={() => onSocial("google")}
                disabled={busy}
                label="Google"
                icon={<GoogleGlyph />}
              />
              <SocialButton
                onClick={() => onSocial("apple")}
                disabled={busy}
                label="Apple"
                icon={<AppleGlyph />}
              />
            </div>

            <p className="mt-8 text-center text-[11px] leading-[1.6] text-ink-subtle">
              By continuing, you agree to our{" "}
              <Link
                href="/privacy"
                className="text-ink underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                className="text-ink underline-offset-4 hover:underline"
              >
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full border border-line bg-white px-3 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-subtle focus:border-ink"
      />
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  busy,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  busy?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy}
      style={{ fontFamily: "var(--font-raleway)" }}
      className="inline-flex items-center justify-center gap-2 bg-ink px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/60"
    >
      {busy && <TbLoader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

function SocialButton({
  onClick,
  disabled,
  label,
  icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      {label}
    </button>
  );
}

function IndiaFlag() {
  return (
    <span
      aria-hidden
      className="inline-flex h-4 w-6 flex-col overflow-hidden rounded-sm border border-black/10"
    >
      <span className="flex-1 bg-[#ff9933]" />
      <span className="flex-1 bg-white" />
      <span className="flex-1 bg-[#138808]" />
    </span>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 35.5 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.4L6.2 33.4C9.5 39.8 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.9 35.2 44 30 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden
      fill="currentColor"
    >
      <path d="M16.365 12.44c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.63-1.7-3.2-1.73-1.36-.14-2.66.8-3.35.8-.7 0-1.76-.78-2.9-.76-1.49.02-2.87.87-3.64 2.2-1.56 2.7-.4 6.7 1.12 8.9.74 1.07 1.62 2.27 2.76 2.23 1.11-.04 1.53-.72 2.87-.72s1.72.72 2.9.7c1.2-.02 1.96-1.08 2.7-2.16.86-1.25 1.21-2.46 1.23-2.52-.03-.01-2.36-.9-2.37-3.63zM14.08 5.52c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.3-.56.63-1.05 1.67-.92 2.66.97.07 1.96-.49 2.56-1.2z" />
    </svg>
  );
}
