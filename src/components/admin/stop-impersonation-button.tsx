"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SUPERADMIN_IMPERSONATION_KEY,
  SUPERADMIN_IMPERSONATION_NAME_KEY,
} from "@/lib/impersonation";

export function StopImpersonationButton() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    setName(sessionStorage.getItem(SUPERADMIN_IMPERSONATION_NAME_KEY));
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        sessionStorage.removeItem(SUPERADMIN_IMPERSONATION_KEY);
        sessionStorage.removeItem(SUPERADMIN_IMPERSONATION_NAME_KEY);
        router.push("/superadmin");
      }}
      className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
    >
      {name && (
        <span className="max-w-[120px] truncate text-xs font-normal text-amber-700">
          {name}
        </span>
      )}
      Stop Impersonating
    </button>
  );
}
