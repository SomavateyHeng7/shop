"use server";

import { revalidatePath } from "next/cache";
import { mockStore } from "@/lib/mock-data";

function asText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function createAdminUserAction(formData: FormData) {
  const email = asText(formData.get("email")).toLowerCase();
  const name = asText(formData.get("name"));
  const role = asText(formData.get("role")) === "superadmin" ? "superadmin" : "admin";

  if (!email || !name) {
    return;
  }

  mockStore.adminUsers.create({ email, name, role });
  mockStore.audit.create({
    actor: "Superadmin",
    action: "Create",
    target: "Admin User",
    details: `Created ${role} ${email}`,
  });

  revalidatePath("/superadmin/admins");
  revalidatePath("/superadmin");
}

export async function toggleAdminActiveAction(formData: FormData) {
  const id = asText(formData.get("id"));
  if (!id) return;

  const updated = mockStore.adminUsers.toggleActive(id);
  if (!updated) return;

  mockStore.audit.create({
    actor: "Superadmin",
    action: "Update",
    target: "Admin User",
    details: `${updated.email} is now ${updated.isActive ? "active" : "disabled"}`,
  });

  revalidatePath("/superadmin/admins");
  revalidatePath("/superadmin");
}

export async function updateAdminRoleAction(formData: FormData) {
  const id = asText(formData.get("id"));
  const role = asText(formData.get("role")) === "superadmin" ? "superadmin" : "admin";

  if (!id) return;

  const updated = mockStore.adminUsers.setRole(id, role);
  if (!updated) return;

  mockStore.audit.create({
    actor: "Superadmin",
    action: "Update",
    target: "Admin User",
    details: `${updated.email} role changed to ${role}`,
  });

  revalidatePath("/superadmin/admins");
  revalidatePath("/superadmin");
}

export async function updateSystemSettingsAction(formData: FormData) {
  const thresholdValue = Number(asText(formData.get("globalLowStockThreshold")) || 0);
  const threshold = Number.isFinite(thresholdValue) ? Math.max(0, Math.round(thresholdValue)) : 0;

  const settings = mockStore.system.updateSettings({
    maintenanceMode: formData.get("maintenanceMode") === "on",
    catalogPublic: formData.get("catalogPublic") === "on",
    adminWritesEnabled: formData.get("adminWritesEnabled") === "on",
    allowNewAdminInvites: formData.get("allowNewAdminInvites") === "on",
    globalLowStockThreshold: threshold,
  });

  mockStore.audit.create({
    actor: "Superadmin",
    action: "Update",
    target: "System Settings",
    details: `Updated system settings (maintenance=${String(settings.maintenanceMode)})`,
  });

  revalidatePath("/superadmin/system");
  revalidatePath("/superadmin");
}

export async function addAuditNoteAction(formData: FormData) {
  const details = asText(formData.get("details"));
  if (!details) return;

  mockStore.audit.create({
    actor: "Superadmin",
    action: "Note",
    target: "Manual Log",
    details,
  });

  revalidatePath("/superadmin/logs");
}
