"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  TbUser,
  TbMapPin,
  TbShoppingBag,
  TbCalendarClock,
  TbStar,
  TbShieldLock,
  TbHeart,
  TbChevronRight,
  TbLogout,
  TbEye,
  TbEyeOff,
  TbCalendarHeart,
  TbCake,
  TbPencil,
  TbMoodHeart,
} from "react-icons/tb";
import { signOut, type AuthUser } from "@/lib/auth";

type SectionId =
  | "details"
  | "orders"
  | "rentals"
  | "addresses"
  | "wishlist"
  | "reviews"
  | "privacy";

const SECTIONS: {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "details", label: "Account Details", icon: <TbUser size={18} /> },
  { id: "orders", label: "My Orders", icon: <TbShoppingBag size={18} /> },
  { id: "rentals", label: "My Rentals", icon: <TbCalendarClock size={18} /> },
  { id: "addresses", label: "Addresses", icon: <TbMapPin size={18} /> },
  { id: "wishlist", label: "Wishlist", icon: <TbHeart size={18} /> },
  { id: "reviews", label: "Reviews", icon: <TbStar size={18} /> },
  { id: "privacy", label: "Privacy & Data", icon: <TbShieldLock size={18} /> },
];

export function AccountDashboard({ user }: { user: AuthUser }) {
  const [active, setActive] = useState<SectionId>("details");
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const displayName =
    user.name || user.email?.split("@")[0] || user.phone || "there";

  return (
    <div className="bg-[#fafafa]">
      <div className="mx-auto w-full max-w-[1300px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
          {/* ── Sidebar ── */}
          <aside className="flex h-fit flex-col rounded-[12px] border border-line bg-white lg:sticky lg:top-24 lg:self-start">
            {/* User card */}
            <div className="border-b border-line px-6 py-6">
              <p
                style={{ fontFamily: "var(--font-raleway)" }}
                className="text-lg font-semibold text-ink"
              >
                {displayName}
              </p>
              <p className="mt-1 break-all text-xs text-ink-muted">
                {user.email || user.phone || "—"}
              </p>
            </div>

            {/* Nav list */}
            <nav className="flex flex-col p-3">
              {SECTIONS.map((s) => {
                const isActive = s.id === active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(s.id)}
                    className={
                      "flex items-center gap-3 rounded-[8px] px-4 py-3 text-left text-sm font-medium transition-colors " +
                      (isActive
                        ? "bg-[#f3f3f3] text-ink"
                        : "text-ink-muted hover:bg-[#fafafa] hover:text-ink")
                    }
                  >
                    <span className={isActive ? "text-ink" : "text-ink-muted"}>
                      {s.icon}
                    </span>
                    <span className="flex-1">{s.label}</span>
                    <TbChevronRight
                      size={14}
                      className={isActive ? "text-ink" : "text-ink-subtle"}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Sign out */}
            <button
              type="button"
              onClick={() => setConfirmSignOut(true)}
              className="flex items-center gap-3 border-t border-line px-6 py-4 text-left text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
            >
              <TbLogout size={18} />
              Sign Out
            </button>
          </aside>

          {/* ── Content ── */}
          <section className="flex flex-col gap-6">
            {active === "details" && <AccountDetails user={user} />}
            {active === "orders" && (
              <StubPanel
                title="My Orders"
                description="Your purchase history will appear here once you place an order."
              />
            )}
            {active === "rentals" && (
              <StubPanel
                title="My Rentals"
                description="Active, upcoming and past rentals will live here. Includes delivery tracking and return pickup."
              />
            )}
            {active === "addresses" && (
              <StubPanel
                title="Addresses"
                description="Save shipping and billing addresses for faster checkout."
                cta={{ label: "Add new address", href: "#" }}
              />
            )}
            {active === "wishlist" && (
              <StubPanel
                title="Wishlist"
                description="Pieces you've saved for later."
                cta={{ label: "Browse the edit", href: "/shop" }}
              />
            )}
            {active === "reviews" && (
              <StubPanel
                title="Reviews"
                description="Rate what you've worn and add photos. Reviews help the circle shop with confidence."
              />
            )}
            {active === "privacy" && <PrivacyPanel />}
          </section>
        </div>
      </div>

      {confirmSignOut && (
        <SignOutModal
          name={displayName}
          onCancel={() => setConfirmSignOut(false)}
          onConfirm={() => {
            setConfirmSignOut(false);
            signOut();
          }}
        />
      )}
    </div>
  );
}

/* ─────────── Sign-out confirmation modal ─────────── */

function SignOutModal({
  name,
  onCancel,
  onConfirm,
}: {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock scroll + ESC to cancel
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[16px] bg-white p-7 text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fdeee8] text-brand-dark"
        >
          <TbMoodHeart size={30} />
        </span>
        <h2
          id="signout-title"
          style={{ fontFamily: "var(--font-raleway)" }}
          className="mt-4 text-xl font-medium text-ink"
        >
          See you soon, {name.split(" ")[0]}!
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Your wishlist and cart will be right here when you&apos;re back.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            style={{ fontFamily: "var(--font-raleway)" }}
            className="inline-flex items-center justify-center gap-2 bg-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-dark"
          >
            Yes, sign out
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─────────── Account Details ─────────── */

function AccountDetails({ user }: { user: AuthUser }) {
  const [first, setFirst] = useState(() => splitName(user.name).first);
  const [last, setLast] = useState(() => splitName(user.name).last);
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [changePassword, setChangePassword] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Dates block — stored in localStorage so it survives refresh in the mock.
  const [birthday, setBirthday] = useState<string>("");
  const [anniversary, setAnniversary] = useState<string>("");
  const [editingDates, setEditingDates] = useState(false);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <div className="rounded-[12px] border border-line bg-white p-6 sm:p-8">
        <SectionHeading title="Account Details" />

        <form
          onSubmit={onSave}
          className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          <FloatingField label="First Name" value={first} onChange={setFirst} />
          <FloatingField label="Last Name" value={last} onChange={setLast} />
          <div className="sm:col-span-2">
            <FloatingField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
            />
          </div>
          <div className="sm:col-span-2">
            <FloatingField
              label="Mobile number"
              type="tel"
              value={phone}
              onChange={setPhone}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="h-4 w-4 accent-ink"
              />
              Change Password
            </label>

            {changePassword && (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FloatingPasswordField
                  label="Current password"
                  value={currentPwd}
                  onChange={setCurrentPwd}
                  show={showCurrent}
                  toggleShow={() => setShowCurrent((v) => !v)}
                />
                <FloatingPasswordField
                  label="New password"
                  value={newPwd}
                  onChange={setNewPwd}
                  show={showNew}
                  toggleShow={() => setShowNew((v) => !v)}
                />
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              style={{ fontFamily: "var(--font-raleway)" }}
              className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-dark"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* ── Important dates ── */}
      <DatesCard
        birthday={birthday}
        anniversary={anniversary}
        editing={editingDates}
        onEditStart={() => setEditingDates(true)}
        onCancel={() => setEditingDates(false)}
        onSave={(b, a) => {
          setBirthday(b);
          setAnniversary(a);
          setEditingDates(false);
        }}
      />
    </>
  );
}

function DatesCard({
  birthday,
  anniversary,
  editing,
  onEditStart,
  onCancel,
  onSave,
}: {
  birthday: string;
  anniversary: string;
  editing: boolean;
  onEditStart: () => void;
  onCancel: () => void;
  onSave: (b: string, a: string) => void;
}) {
  const [draftB, setDraftB] = useState(birthday);
  const [draftA, setDraftA] = useState(anniversary);

  return (
    <div className="rounded-[12px] border border-line bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeading title="Important Dates" subtitle="So we can plan the right surprise." />
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraftB(birthday);
              setDraftA(anniversary);
              onEditStart();
            }}
            className="inline-flex items-center gap-2 border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
          >
            <TbPencil size={14} />
            Edit
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <DateTile
          icon={<TbCake size={22} />}
          label="Birthday"
          value={birthday}
          editing={editing}
          draft={draftB}
          onDraftChange={setDraftB}
        />
        <DateTile
          icon={<TbCalendarHeart size={22} />}
          label="Anniversary"
          value={anniversary}
          editing={editing}
          draft={draftA}
          onDraftChange={setDraftA}
        />
      </div>

      {editing && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onSave(draftB, draftA)}
            style={{ fontFamily: "var(--font-raleway)" }}
            className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-dark"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function DateTile({
  icon,
  label,
  value,
  editing,
  draft,
  onDraftChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  editing: boolean;
  draft: string;
  onDraftChange: (v: string) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fdeee8] text-brand-dark">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {label}
        </p>
        {editing ? (
          <input
            type="date"
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            className="w-full border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          />
        ) : (
          <p className="text-base text-ink">{formatDate(value) || "Not set"}</p>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function splitName(name?: string): { first: string; last: string } {
  if (!name) return { first: "", last: "" };
  const parts = name.trim().split(/\s+/);
  const first = parts.shift() ?? "";
  const last = parts.join(" ");
  return { first, last };
}

/* ─────────── Panels ─────────── */

function StubPanel({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="rounded-[12px] border border-line bg-white p-6 sm:p-8">
      <SectionHeading title={title} />
      <p className="mt-6 text-sm text-ink-muted">{description}</p>
      {cta && (
        <Link
          href={cta.href}
          style={{ fontFamily: "var(--font-raleway)" }}
          className="mt-6 inline-flex items-center gap-2 bg-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand-dark"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function PrivacyPanel() {
  return (
    <div className="rounded-[12px] border border-line bg-white p-6 sm:p-8">
      <SectionHeading
        title="Privacy & Data"
        subtitle="Download a copy of your data or request deletion at any time."
      />
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="#download"
          className="inline-flex w-fit items-center gap-2 border border-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-white"
        >
          Download my data
        </Link>
        <Link
          href="#delete"
          className="inline-flex w-fit items-center gap-2 border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted transition-colors hover:border-ink hover:text-ink"
        >
          Request account deletion
        </Link>
      </div>
      <p className="mt-6 text-xs leading-[1.6] text-ink-muted">
        Deletion removes or anonymises personal data and any virtual try-on
        images within our stated window.
      </p>
    </div>
  );
}

/* ─────────── Primitives ─────────── */

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1
        style={{ fontFamily: "var(--font-raleway)" }}
        className="text-2xl font-medium text-ink"
      >
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-xs text-ink-muted">{subtitle}</p>}
    </div>
  );
}

/**
 * Floating-label input — label sits inside the box above the value, like Kalki.
 * When the field is empty, label still stays at the top since the field is
 * a labelled block (not a placeholder swap).
 */
function FloatingField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="relative flex flex-col gap-1 border border-line bg-white px-4 py-3 transition-colors focus-within:border-ink">
      <span className="text-[11px] font-medium text-ink-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-ink outline-none"
      />
    </label>
  );
}

function FloatingPasswordField({
  label,
  value,
  onChange,
  show,
  toggleShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggleShow: () => void;
}) {
  return (
    <div className="relative flex items-stretch border border-line bg-white transition-colors focus-within:border-ink">
      <label className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-3">
        <span className="text-[11px] font-medium text-ink-muted">{label}</span>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-ink outline-none"
        />
      </label>
      <button
        type="button"
        onClick={toggleShow}
        aria-label={show ? "Hide password" : "Show password"}
        className="flex items-center justify-center px-3 text-ink-muted transition-colors hover:text-ink"
      >
        {show ? <TbEyeOff size={18} /> : <TbEye size={18} />}
      </button>
    </div>
  );
}
