"use client";

import { useRouter } from "next/navigation";
import { SUPERADMIN_IMPERSONATION_KEY } from "@/lib/impersonation";

export function StopImpersonationButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        sessionStorage.removeItem(SUPERADMIN_IMPERSONATION_KEY);
        router.push("/superadmin");
      }}
      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
    >
      Stop Impersonating
    </button>
  );
}
