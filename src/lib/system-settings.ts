import { cache } from "react";
import { prisma } from "./prisma";

// Deduplicated per request — safe to call in multiple layouts/pages
export const getSystemSettings = cache(async () => {
  return prisma.systemSettings.findUnique({ where: { id: "singleton" } });
});
