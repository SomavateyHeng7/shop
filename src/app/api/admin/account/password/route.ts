import bcryptjs from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function PATCH(request: Request) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const admin = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!admin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matchesCurrent = await bcryptjs.compare(
    currentPassword,
    admin.passwordHash,
  );
  if (!matchesCurrent) {
    return Response.json(
      { error: "Current password is incorrect" },
      { status: 400 },
    );
  }

  const sameAsCurrent = await bcryptjs.compare(newPassword, admin.passwordHash);
  if (sameAsCurrent) {
    return Response.json(
      { error: "New password must be different from current password" },
      { status: 400 },
    );
  }

  const passwordHash = await bcryptjs.hash(newPassword, 12);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash },
  });

  return Response.json({ success: true });
}
