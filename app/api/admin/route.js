import { getAuditLogs, getPlatformStats, addAuditLog } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Secure administrative passcode (configured in environment or secret store)
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "ytmr2k26";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const passcode = body.passcode || "";

    if (passcode === ADMIN_PASSCODE) {
      addAuditLog("Admin Login", "Successful authentication into administration panel", "Administrator");
      const stats = getPlatformStats();
      const logs = getAuditLogs();
      return Response.json({ authenticated: true, stats, logs });
    }

    return Response.json({ authenticated: false, error: "Invalid administrator passcode." }, { status: 401 });
  } catch (err) {
    return Response.json({ error: "Authentication failed." }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const passcode = request.headers.get("x-admin-passcode") || new URL(request.url).searchParams.get("passcode");
    if (passcode !== ADMIN_PASSCODE) {
      return Response.json({ error: "Unauthorized access to admin audit logs." }, { status: 401 });
    }
    const stats = getPlatformStats();
    const logs = getAuditLogs();
    return Response.json({ stats, logs });
  } catch (err) {
    return Response.json({ error: "Failed to load admin telemetry." }, { status: 500 });
  }
}
