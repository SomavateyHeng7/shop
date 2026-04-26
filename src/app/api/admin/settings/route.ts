import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  messengerUrl: z.string().url().or(z.literal("")).optional(),
  telegramUrl: z.string().url().or(z.literal("")).optional(),
});

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = {
    messengerUrl: parsed.data.messengerUrl || null,
    telegramUrl: parsed.data.telegramUrl || null,
  };

  const settings = await prisma.systemSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  return Response.json(settings);
}
