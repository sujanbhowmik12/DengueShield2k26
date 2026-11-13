import { getNotifications } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notifications = getNotifications();
    return Response.json({ notifications });
  } catch (err) {
    return Response.json({ error: "Failed to load notifications." }, { status: 500 });
  }
}
