import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session) {
    redirect(session.user.role === "superadmin" ? "/superadmin" : "/admin");
  }

  const resolved = await searchParams;
  const showError = resolved.error === "CredentialsSignin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Control Center Access</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in as admin or superadmin to manage operations and system controls.
        </p>

        <form
          className="mt-6 space-y-4"
          action={async (formData) => {
            "use server";
            try {
              const portal = String(formData.get("portal") ?? "admin") as "admin" | "superadmin";
              await signIn("credentials", {
                email: String(formData.get("email") ?? ""),
                password: String(formData.get("password") ?? ""),
                portal,
                redirectTo: portal === "superadmin" ? "/superadmin" : "/admin",
              });
            } catch (error) {
              if (error instanceof AuthError) {
                redirect("/auth/login?error=CredentialsSignin");
              }
              throw error;
            }
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="portal">
              Portal
            </label>
            <select
              id="portal"
              name="portal"
              defaultValue="admin"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="admin">Admin Dashboard</option>
              <option value="superadmin">Superadmin Console</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          {showError && <p className="text-sm text-red-600">Invalid email or password.</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
