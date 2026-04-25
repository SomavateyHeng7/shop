import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return Response.json({ error: "Invalid file type. Allowed: jpg, png, webp, gif" }, { status: 400 });
  }

  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(UPLOADS_DIR, filename);

  await mkdir(UPLOADS_DIR, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  return Response.json({ url: `/uploads/${filename}` });
}
