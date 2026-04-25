import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const [products, adminUsers, totalCategories, settings] = await Promise.all([
    prisma.product.findMany({ select: { isActive: true, price: true, stock: true, lowStockAt: true } }),
    prisma.adminUser.findMany({ select: { role: true, isActive: true } }),
    prisma.category.count(),
    prisma.systemSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  const threshold = settings?.globalLowStockThreshold ?? 5;

  const response = {
    admins: {
      active: adminUsers.filter((u) => u.isActive).length,
      total: adminUsers.length,
      superadmins: adminUsers.filter((u) => u.role === "superadmin").length,
    },
    catalog: {
      totalProducts: products.length,
      archivedProducts: products.filter((p) => !p.isActive).length,
      totalCategories,
    },
    stock: {
      totalValue: products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0),
      lowStockItems: products.filter((p) => p.stock <= threshold).length,
    },
    settings: settings ?? {
      maintenanceMode: false,
      catalogPublic: true,
      adminWritesEnabled: true,
      allowNewAdminInvites: true,
      globalLowStockThreshold: 5,
    },
  };

  return Response.json(response);
}
