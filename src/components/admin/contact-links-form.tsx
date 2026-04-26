"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Props {
  initialMessenger: string;
  initialTelegram: string;
}

export function ContactLinksForm({ initialMessenger, initialTelegram }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  const [messenger, setMessenger] = useState(initialMessenger);
  const [telegram, setTelegram] = useState(initialTelegram);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (messenger && !isValidUrl(messenger)) errs.messenger = "Must be a valid URL";
    if (telegram && !isValidUrl(telegram)) errs.telegram = "Must be a valid URL";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function save() {
    if (!validate()) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messengerUrl: messenger, telegramUrl: telegram }),
      });
      if (!res.ok) {
        showToast({ title: "Failed to save settings", variant: "error" });
        return;
      }
      showToast({ title: "Settings saved", variant: "success" });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Field
        label="Messenger URL"
        error={errors.messenger}
        hint='e.g. https://m.me/yourpage'
        icon={<MessengerIcon />}
      >
        <Input
          type="url"
          value={messenger}
          onChange={(e) => { setMessenger(e.target.value); setErrors((p) => ({ ...p, messenger: "" })); }}
          placeholder="https://m.me/yourpage"
        />
      </Field>

      <Field
        label="Telegram URL"
        error={errors.telegram}
        hint='e.g. https://t.me/yourusername'
        icon={<TelegramIcon />}
      >
        <Input
          type="url"
          value={telegram}
          onChange={(e) => { setTelegram(e.target.value); setErrors((p) => ({ ...p, telegram: "" })); }}
          placeholder="https://t.me/yourusername"
        />
      </Field>

      <Button onClick={save} disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function Field({ label, error, hint, icon, children }: {
  label: string;
  error?: string;
  hint?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {icon}
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function MessengerIcon() {
  return (
    <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.84 1.26 5.387 3.27 7.14V22l2.98-1.638a10.3 10.3 0 002.75.377c5.523 0 10-4.145 10-9.259S17.523 2 12 2zm1.006 12.466l-2.548-2.718-4.97 2.718 5.473-5.81 2.609 2.718 4.91-2.718-5.474 5.81z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.7 8.01c-.12.57-.46.71-.93.44l-2.57-1.89-1.24 1.19c-.14.14-.25.25-.51.25l.18-2.6 4.74-4.28c.21-.18-.04-.28-.32-.1L7.54 14.6l-2.52-.79c-.55-.17-.56-.55.11-.81l9.86-3.8c.46-.17.86.11.65.6z" />
    </svg>
  );
}
