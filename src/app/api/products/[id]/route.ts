import { mockStore } from "@/lib/mock-data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = mockStore.products.findBySlugOrId(id, true);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(product);
}
