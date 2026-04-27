import { prisma } from "@/lib/prisma";
import { ContactLinksForm } from "@/components/admin/contact-links-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-0">

      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs text-slate-500">Admin panel</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your storefront configuration.</p>
      </div>

      {/* Single card — no sidebar since there's only one real section */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-base font-semibold text-slate-950">Contact links</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add Messenger and Telegram links shown on product pages. Empty fields are hidden.
          </p>
        </div>

        <div className="p-6">
          <ContactLinksForm
            initialMessenger={settings?.messengerUrl ?? ""}
            initialTelegram={settings?.telegramUrl ?? ""}
          />
        </div>
      </div>

    </div>
  );
}