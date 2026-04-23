"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

export function ArchiveButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  const confirm = () => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!response.ok) {
        showToast({ title: "Archive failed", description: "Please try again.", variant: "error" });
        return;
      }
      showToast({ title: "Product archived", variant: "success" });
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {pending ? "Archiving" : "Archive"}
      </button>
      <ConfirmDialog
        open={open}
        title="Archive product?"
        description="This will hide the product from the storefront. You can re-enable it later."
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="danger"
        onCancel={() => setOpen(false)}
        onConfirm={confirm}
      />
    </>
  );
}
