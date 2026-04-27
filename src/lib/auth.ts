import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  portal: z.enum(["admin", "superadmin"]).default("admin"),
});

const MOCK_USERS = [
  { id: "mock-admin-1", email: "admin@example.com", password: "admin", name: "Store Admin", role: "admin" as const },
  {
    id: "mock-superadmin-1",
    email: "superadmin@example.com",
    password: "superadmin",
    name: "System Owner",
    role: "superadmin" as const,
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "mock-frontend-testing-secret",
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const matchedUser = MOCK_USERS.find(
          (entry) =>
            entry.email === parsed.data.email &&
            entry.password === parsed.data.password &&
            entry.role === parsed.data.portal
        );

        if (!matchedUser) return null;

        return {
          id: matchedUser.id,
          email: matchedUser.email,
          name: matchedUser.name,
          role: matchedUser.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "admin" | "superadmin";
      }
      return session;
    },
  },
});
