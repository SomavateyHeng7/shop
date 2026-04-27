<<<<<<< HEAD
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
=======
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';
>>>>>>> feat/finance

const prisma = new PrismaClient();

async function main() {
<<<<<<< HEAD
  // System settings singleton
  await prisma.systemSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      maintenanceMode: false,
      catalogPublic: true,
      adminWritesEnabled: true,
      allowNewAdminInvites: true,
      globalLowStockThreshold: 5,
    },
  });

  // Superadmin user
  const superadminEmail = process.env.SUPERADMIN_EMAIL ?? "superadmin@example.com";
  const superadminPassword = process.env.SUPERADMIN_PASSWORD ?? "superadmin123";
  const superadminName = process.env.SUPERADMIN_NAME ?? "System Owner";

  await prisma.adminUser.upsert({
    where: { email: superadminEmail },
    update: {},
    create: {
      email: superadminEmail,
      passwordHash: await bcrypt.hash(superadminPassword, 12),
      name: superadminName,
      role: "superadmin",
      isActive: true,
    },
  });

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const adminName = process.env.ADMIN_NAME ?? "Store Admin";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: adminName,
      role: "admin",
      isActive: true,
    },
  });

  // Sample categories
  const categories = [
    { name: "Electronics", slug: "electronics" },
    { name: "Clothing", slug: "clothing" },
    { name: "Home & Garden", slug: "home-garden" },
    { name: "Sports", slug: "sports" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const electronics = await prisma.category.findUnique({ where: { slug: "electronics" } });
  const clothing = await prisma.category.findUnique({ where: { slug: "clothing" } });
  const homeGarden = await prisma.category.findUnique({ where: { slug: "home-garden" } });
  const sports = await prisma.category.findUnique({ where: { slug: "sports" } });

  // Sample products
  const products = [
    {
      slug: "wireless-headphones", name: "Wireless Headphones",
      description: "Premium noise-cancelling wireless headphones with 30-hour battery life.",
      price: 129.99, stock: 42, lowStockAt: 5, categoryId: electronics?.id ?? null,
    },
    {
      slug: "mechanical-keyboard", name: "Mechanical Keyboard",
      description: "Tactile mechanical keyboard with RGB backlighting and USB-C connection.",
      price: 89.99, stock: 3, lowStockAt: 5, categoryId: electronics?.id ?? null,
    },
    {
      slug: "running-shoes", name: "Running Shoes",
      description: "Lightweight and breathable running shoes for everyday training.",
      price: 74.99, stock: 0, lowStockAt: 10, categoryId: sports?.id ?? null,
    },
    {
      slug: "cotton-t-shirt", name: "Cotton T-Shirt",
      description: "Comfortable 100% organic cotton t-shirt available in multiple colors.",
      price: 24.99, stock: 120, lowStockAt: 20, categoryId: clothing?.id ?? null,
    },
    {
      slug: "garden-hose", name: "Garden Hose",
      description: "50ft expandable garden hose with 8-pattern spray nozzle.",
      price: 34.99, stock: 18, lowStockAt: 5, categoryId: homeGarden?.id ?? null,
    },
    {
      slug: "usb-c-hub", name: "USB-C Hub",
      description: "7-in-1 USB-C hub with HDMI, SD card reader, and 100W pass-through charging.",
      price: 49.99, stock: 4, lowStockAt: 5, categoryId: electronics?.id ?? null,
    },
    {
      slug: "yoga-mat", name: "Yoga Mat",
      description: "Non-slip 6mm thick yoga mat with alignment lines.",
      price: 39.99, stock: 55, lowStockAt: 10, categoryId: sports?.id ?? null,
    },
    {
      slug: "desk-lamp", name: "LED Desk Lamp",
      description: "Adjustable LED desk lamp with 5 brightness levels and USB charging port.",
      price: 44.99, stock: 0, lowStockAt: 5, categoryId: homeGarden?.id ?? null,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, isActive: true },
    });
  }

  // Seed audit log
  await prisma.auditLog.create({
    data: {
      actor: "System",
      action: "Boot",
      target: "Platform",
      details: "Database seeded successfully",
    },
  });

  console.log("✓ Seed complete");
  console.log(`  Admin:      ${adminEmail} / ${adminPassword}`);
  console.log(`  Superadmin: ${superadminEmail} / ${superadminPassword}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
=======
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.create({
    data: { email, passwordHash, name },
  });

  console.log(`Created admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
>>>>>>> feat/finance
