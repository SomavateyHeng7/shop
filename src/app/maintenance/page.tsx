import { notFound } from "next/navigation";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const settings = await getSystemSettings();
  if (!settings?.maintenanceMode) notFound();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md">
        <p className="text-5xl">🛠️</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-slate-900">
          We&apos;ll be back soon
        </h1>
        <p className="mt-3 text-slate-500">
          The shop is currently undergoing maintenance. Please check back in a little while.
        </p>
      </div>
    </div>
  );
}
