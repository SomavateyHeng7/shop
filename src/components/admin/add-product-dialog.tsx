"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { ProductForm } from "@/components/admin/product-form";

interface CategoryOption {
  id: string;
  name: string;
}

interface Props {
  categories: CategoryOption[];
}

export function AddProductDialog({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
      >
        Add Product
      </button>

      <Modal
        open={open}
        title="Add Product"
        onClose={() => setOpen(false)}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <ProductForm mode="create" categories={categories} onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}
