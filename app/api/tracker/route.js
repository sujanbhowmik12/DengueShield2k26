import { getCases, createCase, updateCase, getPlatformStats } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const verificationStatus = searchParams.get("verificationStatus") || "";
    const district = searchParams.get("district") || "";
    const search = searchParams.get("search") || "";

    const cases = getCases({ status, verificationStatus, district, search });
    const stats = getPlatformStats();

    return Response.json({ cases, stats });
  } catch (err) {
    return Response.json({ error: "Failed to retrieve dengue case records." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.location) {
      return Response.json({ error: "Location is required to report a dengue case." }, { status: 400 });
    }

    const newCase = createCase({
      age: body.age,
      gender: body.gender,
      location: body.location,
      district: body.district || body.location.split(",")[0].trim(),
      state: body.state || "West Bengal",
      country: body.country || "India",
      latitude: body.latitude,
      longitude: body.longitude,
      onsetDate: body.onsetDate,
      status: body.status || "Suspected",
      testType: body.testType || "Clinical Diagnosis",
      plateletCount: body.plateletCount,
      hospitalized: body.hospitalized,
      hospitalName: body.hospitalName,
      notes: body.notes,
    });

    return Response.json({ success: true, case: newCase }, { status: 201 });
  } catch (err) {
    return Response.json({ error: "Failed to submit dengue case report." }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.id) {
      return Response.json({ error: "Case ID is required." }, { status: 400 });
    }

    // Passcode validation for verification updates
    const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "ytmr2k26";
    const passcode = body.passcode || request.headers.get("x-admin-passcode");
    if (passcode !== ADMIN_PASSCODE) {
      return Response.json({ error: "Administrator passcode required to update verification status." }, { status: 401 });
    }

    const updated = updateCase(body.id, {
      status: body.status,
      verificationStatus: body.verificationStatus,
      notes: body.notes,
      actor: body.actor || "Health Administrator",
    });

    if (!updated) {
      return Response.json({ error: "Case not found." }, { status: 404 });
    }

    return Response.json({ success: true, case: updated });
  } catch (err) {
    return Response.json({ error: "Failed to update case record." }, { status: 500 });
  }
}
