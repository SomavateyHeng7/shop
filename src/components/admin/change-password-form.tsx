"use client";

import { FormEvent, useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/ui";

export function ChangePasswordForm() {
  const { showToast } = useToast();

  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function closeModal() {
    if (isSaving) return;
    setOpen(false);
    resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 8) {
      showToast({
        title: "Password too short",
        description: "New password must be at least 8 characters.",
        variant: "warning",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        title: "Passwords do not match",
        description: "Please confirm the same new password.",
        variant: "warning",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        showToast({
          title: "Password update failed",
          description: payload?.error ?? "Please try again.",
          variant: "error",
        });
        return;
      }

      resetForm();
      setOpen(false);
      showToast({
        title: "Password updated",
        description: "Your admin password has been changed.",
        variant: "success",
      });
    } catch {
      showToast({
        title: "Network error",
        description: "Could not update password. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">Security</h2>
      <p className="mt-1 text-sm text-slate-600">
        Update your account password from a secure dialog.
      </p>

      <div className="mt-4">
        <Button onClick={() => setOpen(true)}>Change password</Button>
      </div>

      <Modal
        open={open}
        title="Change Password"
        description="Use a strong password with at least 8 characters."
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Current password
            </label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              New password
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Update password"}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
