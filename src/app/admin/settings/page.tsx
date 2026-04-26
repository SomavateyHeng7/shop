import { prisma } from "@/lib/prisma";
import { ContactLinksForm } from "@/components/admin/contact-links-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure contact links shown to customers on product pages.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Contact Links
        </h2>
        <p className="mb-5 text-xs text-slate-400">
          Leave a field empty to hide that button on the storefront.
        </p>
        <ContactLinksForm
          initialMessenger={settings?.messengerUrl ?? ""}
          initialTelegram={settings?.telegramUrl ?? ""}
        />
      </div>
    </div>
  );
}
