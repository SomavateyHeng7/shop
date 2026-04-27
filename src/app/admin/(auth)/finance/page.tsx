import { prisma } from "@/lib/prisma";
import { FinanceManager } from "@/components/admin/finance-manager";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { financeData: true },
      orderBy: { name: "asc" },
    }),
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let settings = await prisma.financeSettings.findFirst();
  if (!settings) {
    settings = await prisma.financeSettings.create({ data: {} });
  }

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price.toString(),
    stock: p.stock,
    financeData: p.financeData
      ? {
          id: p.financeData.id,
          boughtPrice: p.financeData.boughtPrice.toString(),
          deliveryPrice: p.financeData.deliveryPrice.toString(),
          discountPct: p.financeData.discountPct.toString(),
        }
      : null,
  }));

  const serializedSettings = {
    id: settings.id,
    investmentBudget: settings.investmentBudget.toString(),
    targetGoal: settings.targetGoal.toString(),
  };

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    orderId: o.orderId,
    note: o.note,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      boughtPrice: item.boughtPrice.toString(),
      deliveryPrice: item.deliveryPrice.toString(),
      sellPrice: item.sellPrice.toString(),
      discountPct: item.discountPct.toString(),
    })),
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Finance</h1>
      <FinanceManager
        initialProducts={serializedProducts}
        initialSettings={serializedSettings}
        initialOrders={serializedOrders}
      />
    </div>
  );
}
