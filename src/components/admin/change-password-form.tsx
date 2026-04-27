"use client";

<<<<<<< HEAD
import { useState, useTransition, FormEvent } from "react";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
    setErrors({});
  }

  function close() {
    setOpen(false);
    reset();
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!current) errs.current = "Required";
    if (!next) errs.next = "Required";
    else if (next.length < 8) errs.next = "At least 8 characters";
    if (next !== confirm) errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });

      if (res.ok) {
        showToast({ title: "Password updated", variant: "success" });
        close();
      } else {
        const data = await res.json();
        if (data.error === "Current password is incorrect") {
          setErrors({ current: "Incorrect password" });
        } else {
          showToast({ title: "Failed to update password", variant: "error" });
        }
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Change Password
      </Button>
=======
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
>>>>>>> feat/finance

      <Modal
        open={open}
        title="Change Password"
<<<<<<< HEAD
        description="Enter your current password to set a new one."
        onClose={close}
        footer={
          <>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form="change-password-form" disabled={pending}>
              {pending ? "Updating…" : "Update Password"}
            </Button>
          </>
        }
      >
        <form id="change-password-form" onSubmit={handleSubmit} className="space-y-4">
          <Field label="Current password" error={errors.current}>
            <Input
              type="password"
              value={current}
              onChange={(e) => { setCurrent(e.target.value); setErrors((p) => ({ ...p, current: "" })); }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password" error={errors.next} hint="At least 8 characters">
            <Input
              type="password"
              value={next}
              onChange={(e) => { setNext(e.target.value); setErrors((p) => ({ ...p, next: "" })); }}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm new password" error={errors.confirm}>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: "" })); }}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}

function Field({ label, error, hint, children }: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
=======
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
>>>>>>> feat/finance
  );
}
