"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SUPERADMIN_IMPERSONATION_KEY,
  SUPERADMIN_IMPERSONATION_QUERY,
  SUPERADMIN_IMPERSONATION_VALUE,
} from "@/lib/impersonation";

type AdminImpersonationGateProps = {
  role: "admin" | "superadmin";
  children: React.ReactNode;
};

export function AdminImpersonationGate({ role, children }: AdminImpersonationGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (role !== "superadmin") {
      setIsAllowed(true);
      setIsReady(true);
      return;
    }

    const hasImpersonationIntent =
      searchParams.get(SUPERADMIN_IMPERSONATION_QUERY) === SUPERADMIN_IMPERSONATION_VALUE;

    if (hasImpersonationIntent) {
      sessionStorage.setItem(SUPERADMIN_IMPERSONATION_KEY, "active");
      setIsAllowed(true);
      setIsReady(true);

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete(SUPERADMIN_IMPERSONATION_QUERY);
      const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;

      router.replace(nextUrl);
      return;
    }

    const hasActiveImpersonation = sessionStorage.getItem(SUPERADMIN_IMPERSONATION_KEY) === "active";
    setIsAllowed(hasActiveImpersonation);
    setIsReady(true);
  }, [pathname, role, router, searchParams]);

  if (!isReady) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Validating access...
      </div>
    );
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h1 className="text-xl font-bold text-amber-900">Impersonation Required</h1>
      <p className="mt-2 text-sm text-amber-800">
        Superadmin accounts cannot enter the admin dashboard directly. Start impersonation from the
        superadmin console using the "Impersonate Admin" button.
      </p>
      <div className="mt-4">
        <Link
          href="/superadmin"
          className="inline-flex items-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
        >
          Back to Superadmin Console
        </Link>
      </div>
    </section>
  );
}
