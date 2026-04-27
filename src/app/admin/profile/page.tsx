import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = await auth();

  const user = session?.user?.id
    ? await prisma.adminUser.findUnique({ where: { id: session.user.id } })
    : null;

  const name = user?.name ?? "Admin User";
  const email = user?.email ?? "N/A";
  const role = user?.role ?? "admin";
  const imageUrl = session?.user?.image ?? "";
  const initials = getInitials(name);
  const lastLogin = user?.lastLoginAt ? formatDate(user.lastLoginAt) : "N/A";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-0">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 px-6 py-5">
          <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-950 text-base font-medium text-white">
                {initials}
              </div>
            )}
            <span className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-slate-950">{name}</p>
            <p className="truncate text-sm text-slate-500">{email}</p>
          </div>

          <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
          {[
            { label: "Role", value: role },
            { label: "Last login", value: lastLogin },
            { label: "Account", value: "Verified" },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 truncate text-sm font-semibold capitalize text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Account info
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={name} />
            <Field label="Email" value={email} />
            <Field label="Role" value={role} />
            <Field label="Last login" value={lastLogin} />
          </div>
        </div>

        {/* Security */}
        <div className="px-6 py-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Security
          </p>
          <p className="mb-5 text-sm text-slate-500">
            Update your password to keep your account secure.
          </p>
          <ChangePasswordForm />
        </div>

      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium capitalize text-slate-950">{value}</p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(date: Date) {
  return new Date(date).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}