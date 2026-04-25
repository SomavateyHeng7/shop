import Link from "next/link";
import { redirect } from "next/navigation";
import { SuperadminSidebar } from "@/components/layout/superadmin-sidebar";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function SuperadminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== "superadmin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <Link href="/superadmin" className="text-sm font-bold text-slate-900 leading-tight">
                Superadmin Console
              </Link>
              <p className="text-xs text-slate-500 leading-tight">Platform control center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
              <div className="h-5 w-5 rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white uppercase">
                  {session.user.name?.charAt(0) ?? "S"}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-700">{session.user.name ?? session.user.email}</span>
              <span className="rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                superadmin
              </span>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <SuperadminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
