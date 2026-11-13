import { getHospitals, createHospital, getDonors, registerDonor } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district") || "";
    const bloodGroup = searchParams.get("bloodGroup") || "";
    const type = searchParams.get("type") || "all";

    const hospitals = (type === "all" || type === "hospitals") ? getHospitals(district) : [];
    const donors = (type === "all" || type === "donors") ? getDonors({ district, bloodGroup }) : [];

    return Response.json({ hospitals, donors });
  } catch (err) {
    return Response.json({ error: "Failed to load healthcare directory." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || "register-donor";

    if (action === "register-donor") {
      if (!body.bloodGroup || !body.district) {
        return Response.json({ error: "Blood group and district are required." }, { status: 400 });
      }

      const donor = registerDonor({
        name: body.name,
        bloodGroup: body.bloodGroup,
        donationType: body.donationType,
        district: body.district,
        state: body.state || "West Bengal",
        lastDonationDate: body.lastDonationDate,
      });

      return Response.json({ success: true, donor }, { status: 201 });
    }

    if (action === "add-hospital") {
      const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "ytmr2k26";
      const passcode = body.passcode || request.headers.get("x-admin-passcode");
      if (passcode !== ADMIN_PASSCODE) {
        return Response.json({ error: "Administrator passcode required to register healthcare facilities." }, { status: 401 });
      }

      if (!body.name || !body.district) {
        return Response.json({ error: "Hospital name and district are required." }, { status: 400 });
      }

      const hospital = createHospital({
        name: body.name,
        type: body.type,
        district: body.district,
        state: body.state,
        address: body.address,
        contact: body.contact,
        emergencyPhone: body.emergencyPhone,
        services: body.services,
        latitude: body.latitude,
        longitude: body.longitude,
        bedAvailability: body.bedAvailability,
      });

      return Response.json({ success: true, hospital }, { status: 201 });
    }

    return Response.json({ error: "Invalid action." }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "Operation failed." }, { status: 500 });
  }
}
