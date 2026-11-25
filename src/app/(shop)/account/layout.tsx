import { Suspense } from "react";
import Link from "next/link";
import { AccountNav } from "@/components/account/AccountNav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1340px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <nav className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">My Account</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {/* AccountNav uses usePathname + useAuth (runtime-only hooks). Wrap in
              Suspense so Next's Cache Components prerender can stream it. */}
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-line" />}>
            <AccountNav />
          </Suspense>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
