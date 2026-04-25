import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  catalogPublic: z.boolean().optional(),
  adminWritesEnabled: z.boolean().optional(),
  allowNewAdminInvites: z.boolean().optional(),
  globalLowStockThreshold: z.number().int().min(0).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.systemSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return Response.json(settings);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.systemSettings.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  await prisma.auditLog.create({
    data: {
      actor: "Superadmin API",
      action: "Update",
      target: "System Settings",
      details: "System settings updated via API",
    },
  });

  return Response.json(updated);
}
