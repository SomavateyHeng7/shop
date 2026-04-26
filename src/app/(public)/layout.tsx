import { redirect } from "next/navigation";
import { getSystemSettings } from "@/lib/system-settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSystemSettings();

  if (settings?.maintenanceMode) {
    redirect("/maintenance");
  }

  return <>{children}</>;
}
