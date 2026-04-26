"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { signOutAction } from "@/lib/actions/auth";

interface Props {
  name: string | null;
  email: string;
  role: "admin" | "superadmin";
}

export function ProfileMenu({ name, email, role }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initials = (name ?? email).charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-600 text-sm font-bold text-white hover:bg-accent-700"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-sand-200 bg-white py-1.5 shadow-xl">
          {/* Identity */}
          <div className="border-b border-sand-100 px-4 py-2.5">
            <p className="truncate text-sm font-semibold text-ink-900">{name ?? email}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>

          {/* Switch links */}
          <div className="py-1">
            {role === "superadmin" && (
              <Link
                href="/superadmin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-ink-700 hover:bg-sand-50"
              >
                Switch to Superadmin
              </Link>
            )}
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-ink-700 hover:bg-sand-50"
            >
              Switch to Admin
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-sand-100 py-1">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
