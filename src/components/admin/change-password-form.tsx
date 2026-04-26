"use client";

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

      <Modal
        open={open}
        title="Change Password"
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
  );
}
