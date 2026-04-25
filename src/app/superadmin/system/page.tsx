import { updateSystemSettingsAction } from "@/app/superadmin/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function Toggle({ name, checked, label, description, danger }: {
  name: string;
  checked: boolean;
  label: string;
  description: string;
  danger?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start justify-between gap-4 rounded-xl border p-4 transition hover:bg-slate-50 ${
        danger && checked ? "border-red-200 bg-red-50 hover:bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <span className="min-w-0">
        <span className={`block text-sm font-semibold ${danger && checked ? "text-red-900" : "text-slate-900"}`}>
          {label}
        </span>
        <span className={`mt-0.5 block text-xs leading-relaxed ${danger && checked ? "text-red-600" : "text-slate-500"}`}>
          {description}
        </span>
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input name={name} type="checkbox" defaultChecked={checked} className="peer sr-only" />
        <span
          className={`block h-6 w-11 rounded-full border-2 transition peer-checked:border-transparent ${
            danger ? "border-slate-200 peer-checked:bg-red-500" : "border-slate-200 peer-checked:bg-slate-900"
          } bg-slate-100`}
        />
        <span className="pointer-events-none absolute left-0.5 top-0.5 block h-5 w-5 translate-x-0 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default async function SuperadminSystemPage() {
  const settings = await prisma.systemSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">System Controls</h1>
        <p className="mt-1 text-sm text-slate-500">
          Apply platform-wide policies that affect storefront visibility and admin write access.
        </p>
      </section>

      <form action={updateSystemSettingsAction} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-500">Visibility & Access</h2>
          <p className="mb-4 text-xs text-slate-400">Control what users and admins can see and do.</p>
          <div className="space-y-3">
            <Toggle
              name="catalogPublic"
              checked={settings.catalogPublic}
              label="Catalog Visibility"
              description="Allow public users to browse products and categories on the storefront."
            />
            <Toggle
              name="adminWritesEnabled"
              checked={settings.adminWritesEnabled}
              label="Admin Write Access"
              description="Enable product and category edits from the admin interface."
            />
            <Toggle
              name="allowNewAdminInvites"
              checked={settings.allowNewAdminInvites}
              label="Allow New Admin Invites"
              description="Permit superadmins to invite and create new admin user accounts."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-500">Inventory</h2>
          <p className="mb-4 text-xs text-slate-400">Thresholds used in reports and alerts across the platform.</p>
          <div className="rounded-xl border border-slate-200 p-4">
            <label className="block text-sm font-semibold text-slate-900" htmlFor="globalLowStockThreshold">
              Global Low-Stock Threshold
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Products at or below this quantity are flagged as low-stock in dashboards.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <input
                id="globalLowStockThreshold"
                name="globalLowStockThreshold"
                type="number"
                min={0}
                defaultValue={settings.globalLowStockThreshold}
                className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none ring-slate-900 transition focus:border-slate-400 focus:bg-white focus:ring-2"
              />
              <span className="text-xs text-slate-500">units</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-700">Danger Zone</h2>
          </div>
          <Toggle
            name="maintenanceMode"
            checked={settings.maintenanceMode}
            label="Maintenance Mode"
            description="Freeze all storefront operations. Users will see a maintenance page. Use only for planned downtime."
            danger
          />
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-black"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
