import Link from "next/link";
import { ImpersonateAdminButton } from "@/components/superadmin/impersonate-admin-button";
import { mockStore } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const ACTION_STYLES: Record<string, string> = {
  Create: "bg-emerald-100 text-emerald-700",
  Update: "bg-blue-100 text-blue-700",
  Delete: "bg-red-100 text-red-700",
  Note: "bg-amber-100 text-amber-700",
};

export default async function SuperadminOverviewPage() {
  const products = mockStore.products.findMany({ includeInactive: true });
  const categories = mockStore.categories.findMany();
  const settings = mockStore.system.getSettings();
  const activeAdmins = mockStore.adminUsers.activeCount();
  const totalAdmins = mockStore.adminUsers.findMany().length;
  const superadmins = mockStore.adminUsers.countByRole("superadmin");
  const lowStockItems = products.filter((item) => item.stock <= settings.globalLowStockThreshold).length;
  const inactiveProducts = products.filter((item) => !item.isActive).length;
  const totalStockValue = products.reduce((sum, product) => sum + product.stock * product.price, 0);
  const audit = mockStore.audit.list(6);

  const isOperational = !settings.maintenanceMode;

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">System Command Center</h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
              isOperational ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isOperational ? "Operational" : "Maintenance"}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Oversee platform health, control admin access, and enforce system-wide policies.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Admin Users</p>
            <div className="rounded-lg bg-blue-100 p-1.5">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-blue-900">
            {activeAdmins}
            <span className="text-lg font-medium text-blue-400">/{totalAdmins}</span>
          </p>
          <p className="mt-1 text-xs text-blue-600">{superadmins} superadmin · {totalAdmins - activeAdmins} inactive</p>
        </article>

        <article className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Catalog</p>
            <div className="rounded-lg bg-violet-100 p-1.5">
              <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-violet-900">{products.length}</p>
          <p className="mt-1 text-xs text-violet-600">{categories.length} categories · {inactiveProducts} archived</p>
        </article>

        <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Stock Value</p>
            <div className="rounded-lg bg-emerald-100 p-1.5">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-900">${totalStockValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
          <p className="mt-1 text-xs text-emerald-600">{lowStockItems} below low-stock threshold</p>
        </article>

        <article className={`rounded-2xl border p-5 ${isOperational ? "border-slate-200 bg-white" : "border-red-100 bg-red-50"}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-bold uppercase tracking-wider ${isOperational ? "text-slate-500" : "text-red-600"}`}>System</p>
            <div className={`rounded-lg p-1.5 ${isOperational ? "bg-emerald-100" : "bg-red-100"}`}>
              <svg className={`h-4 w-4 ${isOperational ? "text-emerald-600" : "text-red-600"}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
            </div>
          </div>
          <p className={`mt-3 text-2xl font-bold ${isOperational ? "text-slate-900" : "text-red-900"}`}>
            {isOperational ? "Operational" : "Maintenance"}
          </p>
          <p className={`mt-1 text-xs ${isOperational ? "text-slate-500" : "text-red-600"}`}>
            Catalog {settings.catalogPublic ? "public" : "private"} · writes {settings.adminWritesEnabled ? "on" : "off"}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Control Surfaces</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/superadmin/admins", label: "Manage Admin Accounts", desc: "Create, suspend, and role-assign" },
              { href: "/superadmin/system", label: "System Policies", desc: "Toggles & global thresholds" },
              { href: "/superadmin/logs", label: "Audit Timeline", desc: "Review all platform events" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-slate-200 p-4 transition hover:border-slate-900 hover:bg-slate-900"
              >
                <p className="text-sm font-semibold text-slate-900 transition group-hover:text-white">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-500 transition group-hover:text-slate-400">{item.desc}</p>
              </Link>
            ))}
            <ImpersonateAdminButton className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900 transition hover:border-amber-300 hover:bg-amber-100" />
            <div className="-mt-2 px-1 text-xs text-amber-700 sm:col-span-2">
              Enter the admin dashboard in impersonation mode.
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Activity</h2>
            <Link href="/superadmin/logs" className="text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {audit.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
                No audit events recorded yet.
              </p>
            ) : (
              audit.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      ACTION_STYLES[entry.action] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {entry.action}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{entry.target}</p>
                    <p className="truncate text-xs text-slate-500">{entry.details}</p>
                    <p className="text-[10px] text-slate-400">{entry.createdAt.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
