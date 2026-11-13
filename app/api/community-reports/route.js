import { getCommunityReports, createCommunityReport, updateCommunityReport } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";
    const district = searchParams.get("district") || "";

    const reports = getCommunityReports({ status, category, district });
    return Response.json({ reports });
  } catch (err) {
    return Response.json({ error: "Failed to fetch community reports." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.title || !body.location) {
      return Response.json({ error: "Title and location are required." }, { status: 400 });
    }

    const report = createCommunityReport({
      title: body.title,
      category: body.category || "Stagnant Water",
      description: body.description,
      location: body.location,
      district: body.district || body.location.split(",")[0].trim(),
      latitude: body.latitude,
      longitude: body.longitude,
      priority: body.priority || "Medium",
      reporterName: body.reporterName || "Community Member",
      imageUrl: body.imageUrl || "/icon.png",
    });

    return Response.json({ success: true, report }, { status: 201 });
  } catch (err) {
    return Response.json({ error: "Failed to submit breeding site report." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.id) {
      return Response.json({ error: "Report ID is required." }, { status: 400 });
    }

    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "ytmr2k26";
    const passcode = body.passcode || request.headers.get("x-admin-passcode");
    if (passcode !== ADMIN_PASSCODE) {
      return Response.json({ error: "Administrator passcode required to moderate reports." }, { status: 401 });
    }

    const updated = updateCommunityReport(body.id, {
      status: body.status,
      actionTaken: body.actionTaken,
      verifiedBy: body.verifiedBy || "Municipal Vector Inspector",
      actor: body.actor || "Administrator",
    });

    if (!updated) {
      return Response.json({ error: "Report not found." }, { status: 404 });
    }

    return Response.json({ success: true, report: updated });
  } catch (err) {
    return Response.json({ error: "Failed to update report status." }, { status: 500 });
  }
}
