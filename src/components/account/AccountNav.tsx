"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TbUser,
  TbPackage,
  TbMapPin,
  TbHeart,
  TbCreditCard,
  TbCoin,
  TbLogout,
} from "react-icons/tb";
import { signOut, useAuth } from "@/lib/auth";

const items = [
  { href: "/account", label: "Profile", Icon: TbUser, exact: true },
  { href: "/account/orders", label: "Orders", Icon: TbPackage },
  { href: "/account/loyalty", label: "Loyalty & Referrals", Icon: TbCoin },
  { href: "/account/addresses", label: "Addresses", Icon: TbMapPin },
  { href: "/account/wishlist", label: "Wishlist", Icon: TbHeart },
  { href: "/account/membership", label: "Membership", Icon: TbCreditCard },
];

export function AccountNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="border border-line bg-white p-5">
      {user && (
        <div className="mb-5 border-b border-line pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
            Signed in as
          </p>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-ink">
            {user.name ?? user.phone ?? user.email ?? "Guest"}
          </p>
        </div>
      )}
      <ul className="space-y-1">
        {items.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${active ? "bg-brand-tint font-semibold text-ink" : "text-ink-muted hover:bg-bg hover:text-ink"}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      {user && (
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 flex w-full items-center gap-3 border-t border-line px-3 pt-4 text-sm text-ink-muted hover:text-ink"
        >
          <TbLogout size={18} />
          Sign out
        </button>
      )}
    </nav>
  );
}
