import {
  createAdminUserAction,
  toggleAdminActiveAction,
  updateAdminRoleAction,
} from "@/app/superadmin/actions";
import { mockStore } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function SuperadminAdminsPage() {
  const admins = mockStore.adminUsers.findMany();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Admin User Control</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create admin accounts, grant superadmin privileges, and suspend access instantly.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Create Admin User</h2>
        <form action={createAdminUserAction} className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto]">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600" htmlFor="create-name">Full name</label>
            <input
              id="create-name"
              name="name"
              placeholder="Jane Smith"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-slate-900 transition focus:border-slate-400 focus:bg-white focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600" htmlFor="create-email">Email address</label>
            <input
              id="create-email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-slate-900 transition focus:border-slate-400 focus:bg-white focus:ring-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600" htmlFor="create-role">Role</label>
            <select
              id="create-role"
              name="role"
              defaultValue="admin"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-slate-900 transition focus:border-slate-400 focus:bg-white focus:ring-2"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black"
            >
              Create
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Access Matrix</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
              {admins.length} accounts
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">User</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Last login</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {admins.map((admin) => (
                <tr key={admin.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{admin.name}</p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                        admin.role === "superadmin"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        admin.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${admin.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {admin.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {admin.lastLoginAt ? admin.lastLoginAt.toLocaleString() : "Never"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={toggleAdminActiveAction}>
                        <input type="hidden" name="id" value={admin.id} />
                        <button
                          type="submit"
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            admin.isActive
                              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {admin.isActive ? "Disable" : "Activate"}
                        </button>
                      </form>
                      <form action={updateAdminRoleAction} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={admin.id} />
                        <select
                          name="role"
                          defaultValue={admin.role}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Save
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
