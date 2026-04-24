"use client";

import Link from "next/link";
import {
  SUPERADMIN_IMPERSONATION_QUERY,
  SUPERADMIN_IMPERSONATION_VALUE,
} from "@/lib/impersonation";

type ImpersonateAdminButtonProps = {
  className?: string;
};

export function ImpersonateAdminButton({ className }: ImpersonateAdminButtonProps) {
  return (
    <Link
      href={`/admin?${SUPERADMIN_IMPERSONATION_QUERY}=${SUPERADMIN_IMPERSONATION_VALUE}`}
      className={className}
    >
      Impersonate Admin
    </Link>
  );
}
