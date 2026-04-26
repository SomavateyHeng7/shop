import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  investmentBudget: z.number().min(0),
  targetGoal: z.number().min(0),
});

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.financeSettings.findFirst();
  const settings = existing
    ? await prisma.financeSettings.update({
        where: { id: existing.id },
        data: parsed.data,
      })
    : await prisma.financeSettings.create({ data: parsed.data });

  return Response.json(settings);
}
