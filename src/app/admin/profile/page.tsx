import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.adminUser.findUnique({ where: { id: session.user.id } })
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>

      {/* Info card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Account Info</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-900">{user?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-900">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700">
              {user?.role}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last login</span>
            <span className="font-medium text-slate-900">
              {user?.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—"}
            </span>
          </div>
        </div>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
