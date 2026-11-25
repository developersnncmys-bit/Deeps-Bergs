"use client";

import { useEffect, useState } from "react";
import {
  TbPlus,
  TbMapPin,
  TbHome2,
  TbBriefcase,
  TbPencil,
  TbTrash,
  TbStar,
  TbStarFilled,
  TbX,
} from "react-icons/tb";

export interface SavedAddress {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

// v2 — v1 shipped with seed data; bump so returning users don't see the stale seed.
const STORAGE_KEY = "dbf.addresses.v2";

export function AddressesPanel() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [adding, setAdding] = useState(false);

  // Hydrate from localStorage — no seed; new users start with an empty list and
  // addresses accumulate as they add them here or complete a checkout.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAddresses(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    } catch {
      /* ignore */
    }
  }, [addresses, hydrated]);

  const upsert = (a: SavedAddress) => {
    setAddresses((prev) => {
      const exists = prev.some((p) => p.id === a.id);
      const next = exists
        ? prev.map((p) => (p.id === a.id ? a : p))
        : [...prev, a];
      // Ensure only one default
      if (a.isDefault) {
        return next.map((p) =>
          p.id === a.id ? p : { ...p, isDefault: false },
        );
      }
      // If there's no default at all, default the first
      if (!next.some((p) => p.isDefault) && next.length > 0) {
        return next.map((p, i) => (i === 0 ? { ...p, isDefault: true } : p));
      }
      return next;
    });
  };

  const remove = (id: string) => {
    setAddresses((prev) => {
      const wasDefault = prev.find((p) => p.id === id)?.isDefault;
      const next = prev.filter((p) => p.id !== id);
      if (wasDefault && next.length > 0) next[0].isDefault = true;
      return next;
    });
  };

  const setDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id })),
    );
  };

  return (
    <div>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">
            Saved Addresses
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Add and manage addresses you want to use at checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#3a3a3a]"
        >
          <TbPlus size={14} />
          Add Address
        </button>
      </header>

      {addresses.length === 0 ? (
        <div className="mt-8 border border-dashed border-line-strong p-10 text-center">
          <TbMapPin size={32} className="mx-auto text-ink-muted" />
          <p className="mt-3 font-serif text-xl text-ink">No saved addresses</p>
          <p className="mt-1 text-sm text-ink-muted">
            Add one to speed up checkout.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id}>
              <AddressCard
                address={a}
                onEdit={() => setEditing(a)}
                onDelete={() => remove(a.id)}
                onSetDefault={() => setDefault(a.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {(adding || editing) && (
        <AddressDialog
          initial={editing ?? undefined}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={(a) => {
            upsert(a);
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: SavedAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const TypeIcon =
    address.type === "work"
      ? TbBriefcase
      : address.type === "home"
        ? TbHome2
        : TbMapPin;
  return (
    <div
      className={`flex h-full flex-col gap-3 border bg-white p-5 transition-colors ${
        address.isDefault ? "border-ink" : "border-line hover:border-ink"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-bg text-ink">
            <TypeIcon size={14} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {address.type}
          </span>
          {address.isDefault && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-dark">
              <TbStarFilled size={10} />
              Default
            </span>
          )}
        </div>
      </div>

      <div className="text-sm">
        <p className="font-semibold text-ink">{address.name}</p>
        <p className="mt-1 text-ink-muted">
          {address.line1}
          {address.line2 && `, ${address.line2}`}
          <br />
          {address.city}, {address.state} {address.pincode}
          <br />
          {address.phone}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-4 border-t border-line pt-3 text-xs">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-brand"
        >
          <TbPencil size={13} /> Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 font-semibold text-ink-muted hover:text-danger"
          style={{ color: "inherit" }}
        >
          <TbTrash size={13} /> Delete
        </button>
        {!address.isDefault && (
          <button
            type="button"
            onClick={onSetDefault}
            className="ml-auto inline-flex items-center gap-1.5 font-semibold text-brand-dark hover:text-ink"
          >
            <TbStar size={13} /> Set as default
          </button>
        )}
      </div>
    </div>
  );
}

function AddressDialog({
  initial,
  onClose,
  onSave,
}: {
  initial?: SavedAddress;
  onClose: () => void;
  onSave: (a: SavedAddress) => void;
}) {
  const [form, setForm] = useState<SavedAddress>(
    initial ?? {
      id: `addr-${Date.now()}`,
      type: "home",
      name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    },
  );

  const update = (k: keyof SavedAddress, v: string | boolean) =>
    setForm({ ...form, [k]: v });

  const valid =
    form.name.trim() &&
    form.phone.trim().length >= 10 &&
    form.line1.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.pincode.trim().length === 6;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-xl text-ink">
            {initial ? "Edit address" : "Add a new address"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-bg"
          >
            <TbX size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Type pills */}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Address type
          </p>
          <div className="flex gap-2">
            {(["home", "work", "other"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update("type", t)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  form.type === t
                    ? "border-ink bg-ink text-white"
                    : "border-ink text-ink hover:bg-ink hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <AField label="Full name" value={form.name} onChange={(v) => update("name", v)} />
            <AField
              label="Mobile"
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v.replace(/\D/g, "").slice(0, 10))}
            />
            <div className="sm:col-span-2">
              <AField
                label="Address line 1"
                value={form.line1}
                onChange={(v) => update("line1", v)}
              />
            </div>
            <div className="sm:col-span-2">
              <AField
                label="Address line 2 (optional)"
                value={form.line2 ?? ""}
                onChange={(v) => update("line2", v)}
              />
            </div>
            <AField label="City" value={form.city} onChange={(v) => update("city", v)} />
            <AField label="State" value={form.state} onChange={(v) => update("state", v)} />
            <AField
              label="Pincode"
              value={form.pincode}
              onChange={(v) => update("pincode", v.replace(/\D/g, "").slice(0, 6))}
            />
          </div>

          <label className="mt-5 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.isDefault ?? false}
              onChange={(e) => update("isDefault", e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Make this my default address
          </label>
        </div>

        <footer className="flex items-center gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-ink py-3 text-sm font-semibold text-ink transition-colors hover:bg-bg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => valid && onSave(form)}
            disabled={!valid}
            className={`flex-1 rounded-full py-3 text-sm font-semibold text-white transition-colors ${
              valid
                ? "bg-ink hover:bg-[#3a3a3a]"
                : "cursor-not-allowed bg-line-strong"
            }`}
          >
            {initial ? "Save changes" : "Save address"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function AField({
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
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-line-strong bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-ink"
        style={{ outline: "none", boxShadow: "none" }}
      />
    </label>
  );
}
