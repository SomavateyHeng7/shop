import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminImpersonationGate } from "@/components/admin/admin-impersonation-gate";
import { StopImpersonationButton } from "@/components/admin/stop-impersonation-button";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname");
  const isLoginRoute = pathname === "/admin/login";

  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  if (isLoginRoute) {
    return <>{children}</>;
  }

  const settings = await getSystemSettings();
  const writesDisabled = settings?.adminWritesEnabled === false;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="text-xl font-semibold text-slate-900">
            Admin Dashboard
          </Link>
          <div className="flex items-center gap-2">
            {session.user.role === "superadmin" && <StopImpersonationButton />}
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {writesDisabled && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-800">
          Admin write access is currently disabled. Products and categories cannot be created or edited.
        </div>
      )}

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <AdminSidebar />
        <AdminImpersonationGate role={session.user.role}>
          <div>{children}</div>
        </AdminImpersonationGate>
      </div>
    </div>
  );
}
