import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your account details and keep your password secure.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">User Profile</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {admin.name?.trim() || "Not set"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-1 font-medium text-slate-900">{admin.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Member since</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {admin.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </section>

      <ChangePasswordForm />
    </div>
  );
}
