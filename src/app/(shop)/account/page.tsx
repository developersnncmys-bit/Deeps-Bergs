"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TbPackage,
  TbCoin,
  TbMapPin,
  TbHeart,
  TbCreditCard,
} from "react-icons/tb";
import { useAuth, openAuth } from "@/lib/auth";
import { pointsBalance } from "@/lib/mock-data/loyalty";
import { orders } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

const QUICK_LINKS = [
  {
    href: "/account/orders",
    Icon: TbPackage,
    label: "Orders",
    sub: "Track, return, download invoice",
  },
  {
    href: "/account/loyalty",
    Icon: TbCoin,
    label: "Loyalty & Referrals",
    sub: "Points balance & referral code",
  },
  {
    href: "/account/addresses",
    Icon: TbMapPin,
    label: "Addresses",
    sub: "Manage saved shipping addresses",
  },
  {
    href: "/account/wishlist",
    Icon: TbHeart,
    label: "Wishlist",
    sub: "Pieces you've saved for later",
  },
  {
    href: "/account/membership",
    Icon: TbCreditCard,
    label: "Membership",
    sub: "Benefits, renewal, try-on credits",
  },
];

export default function AccountPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  // Guests who hit /account directly get bounced to home and the auth popup
  // opens automatically — the signed-in dashboard is the only thing this route
  // ever renders.
  useEffect(() => {
    if (ready && !user) {
      router.replace("/");
      openAuth();
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return <div className="min-h-[60vh] bg-white" aria-busy="true" />;
  }

  const name = user.name ?? user.email?.split("@")[0] ?? "Welcome";
  const activeOrders = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "returned" && o.status !== "cancelled",
  ).length;
  const balance = pointsBalance();

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <header className="border border-line bg-white p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
          My Account
        </p>
        <h1 className="mt-2 font-serif text-3xl capitalize text-ink sm:text-4xl">
          Hello, {name}
        </h1>
        {user.email && (
          <p className="mt-1 text-sm text-ink-muted">{user.email}</p>
        )}
        {user.phone && (
          <p className="mt-0.5 text-sm text-ink-muted">{user.phone}</p>
        )}
      </header>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active orders"
          value={activeOrders.toString()}
          href="/account/orders"
          Icon={TbPackage}
        />
        <StatCard
          label="Loyalty points"
          value={balance.toLocaleString("en-IN")}
          sub={`Worth ${formatINR(balance)} at checkout`}
          href="/account/loyalty"
          Icon={TbCoin}
        />
        <StatCard
          label="Saved addresses"
          value="1"
          href="/account/addresses"
          Icon={TbMapPin}
        />
      </div>

      {/* Quick links */}
      <section>
        <h2 className="mb-4 font-serif text-xl text-ink">Quick links</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ href, Icon, label, sub }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-4 border border-line bg-white p-4 transition-colors hover:border-ink"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white">
                  <Icon size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="text-xs text-ink-muted">{sub}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  href,
  Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  href: string;
  Icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 border border-line bg-white p-5 transition-colors hover:border-ink"
    >
      <div className="flex items-center justify-between text-ink-muted">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
          {label}
        </span>
        <Icon size={18} className="transition-colors group-hover:text-ink" />
      </div>
      <p className="font-serif text-3xl text-ink">{value}</p>
      {sub && <p className="text-xs text-ink-muted">{sub}</p>}
    </Link>
  );
}
