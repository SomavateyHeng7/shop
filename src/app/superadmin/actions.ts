"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function asText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createAdminUserAction(formData: FormData) {
  const email = asText(formData.get("email")).toLowerCase();
  const name = asText(formData.get("name"));
  const role = asText(formData.get("role")) === "superadmin" ? "superadmin" : "admin";
  const password = asText(formData.get("password")) || "changeme123";

  if (!email || !name) return;

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.create({ data: { email, name, role, passwordHash } });
  await prisma.auditLog.create({
    data: { actor: "Superadmin", action: "Create", target: "Admin User", details: `Created ${role} ${email}` },
  });

  revalidatePath("/superadmin/admins");
  revalidatePath("/superadmin");
}

export async function toggleAdminActiveAction(formData: FormData) {
  const id = asText(formData.get("id"));
  if (!id) return;

  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (!user) return;

  const updated = await prisma.adminUser.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  await prisma.auditLog.create({
    data: {
      actor: "Superadmin",
      action: "Update",
      target: "Admin User",
      details: `${updated.email} is now ${updated.isActive ? "active" : "disabled"}`,
    },
  });

  revalidatePath("/superadmin/admins");
  revalidatePath("/superadmin");
}

export async function updateAdminRoleAction(formData: FormData) {
  const id = asText(formData.get("id"));
  const role = asText(formData.get("role")) === "superadmin" ? "superadmin" : "admin";
  if (!id) return;

  const updated = await prisma.adminUser.update({ where: { id }, data: { role } });

  await prisma.auditLog.create({
    data: {
      actor: "Superadmin",
      action: "Update",
      target: "Admin User",
      details: `${updated.email} role changed to ${role}`,
    },
  });

  revalidatePath("/superadmin/admins");
  revalidatePath("/superadmin");
}

export async function updateSystemSettingsAction(formData: FormData) {
  const thresholdValue = Number(asText(formData.get("globalLowStockThreshold")) || 0);
  const threshold = Number.isFinite(thresholdValue) ? Math.max(0, Math.round(thresholdValue)) : 0;

  const data = {
    maintenanceMode: formData.get("maintenanceMode") === "on",
    catalogPublic: formData.get("catalogPublic") === "on",
    adminWritesEnabled: formData.get("adminWritesEnabled") === "on",
    allowNewAdminInvites: formData.get("allowNewAdminInvites") === "on",
    globalLowStockThreshold: threshold,
  };

  const settings = await prisma.systemSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  await prisma.auditLog.create({
    data: {
      actor: "Superadmin",
      action: "Update",
      target: "System Settings",
      details: `Updated system settings (maintenance=${String(settings.maintenanceMode)})`,
    },
  });

  revalidatePath("/superadmin/system");
  revalidatePath("/superadmin");
}

export async function addAuditNoteAction(formData: FormData) {
  const details = asText(formData.get("details"));
  if (!details) return;

  await prisma.auditLog.create({
    data: { actor: "Superadmin", action: "Note", target: "Manual Log", details },
  });

  revalidatePath("/superadmin/logs");
}
