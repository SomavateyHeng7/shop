import { mockStore } from "@/lib/mock-data";
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

  return Response.json(mockStore.system.getSettings());
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

  const updated = mockStore.system.updateSettings(parsed.data);
  mockStore.audit.create({
    actor: "Superadmin API",
    action: "Update",
    target: "System Settings",
    details: "System settings updated via API",
  });

  return Response.json(updated);
}
