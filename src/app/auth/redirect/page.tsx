import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");
  redirect(session.user.role === "superadmin" ? "/superadmin" : "/admin");
}
