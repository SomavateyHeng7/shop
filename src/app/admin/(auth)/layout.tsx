import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminImpersonationGate } from "@/components/admin/admin-impersonation-gate";
import { StopImpersonationButton } from "@/components/admin/stop-impersonation-button";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { auth, signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="shrink-0">
            <Image
              src="/st-shop.png"
              alt="ST Shop"
              width={120}
              height={40}
              style={{ height: 40, width: "auto" }}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            {session.user.role === "superadmin" && <StopImpersonationButton />}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/auth/login" });
              }}
            >
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

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <AdminSidebar />
        <AdminImpersonationGate role={session.user.role}>
          <div>{children}</div>
        </AdminImpersonationGate>
      </div>
    </div>
  );
}