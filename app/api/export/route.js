import { getCases, getCommunityReports, getSurveys, getPlatformStats } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatCSVCell(val) {
  const str = String(val ?? "").replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "cases";

    const timestamp = new Date().toISOString().slice(0, 10);

    if (type === "cases") {
      const cases = getCases();
      const headers = ["Case_ID", "Patient_Code", "Age", "Gender", "Location", "District", "State", "Onset_Date", "Report_Date", "Status", "Verification_Status", "Test_Type", "Platelet_Count", "Hospitalized", "Hospital_Name"];
      const rows = cases.map(c => [
        c.id,
        c.patientCode,
        c.age,
        c.gender,
        c.location,
        c.district,
        c.state,
        c.onsetDate,
        c.reportDate,
        c.status,
        c.verificationStatus,
        c.testType,
        c.plateletCount ?? "N/A",
        c.hospitalized ? "Yes" : "No",
        c.hospitalName
      ].map(formatCSVCell).join(","));

      const csv = [
        `# DengueShield Public Health Surveillance Export - Cases`,
        `# Generated: ${new Date().toISOString()} | Source: DengueShield Case Surveillance`,
        headers.join(","),
        ...rows
      ].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="dengueshield_cases_${timestamp}.csv"`,
        },
      });
    }

    if (type === "reports") {
      const reports = getCommunityReports();
      const headers = ["Report_ID", "Title", "Category", "Location", "District", "Reported_At", "Status", "Priority", "Reporter", "Action_Taken"];
      const rows = reports.map(r => [
        r.id,
        r.title,
        r.category,
        r.location,
        r.district,
        r.reportedAt,
        r.status,
        r.priority,
        r.reporterName,
        r.actionTaken || "Pending inspection"
      ].map(formatCSVCell).join(","));

      const csv = [
        `# DengueShield Community Breeding Site Reports`,
        `# Generated: ${new Date().toISOString()} | Source: DengueShield Community Reports`,
        headers.join(","),
        ...rows
      ].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="dengueshield_community_reports_${timestamp}.csv"`,
        },
      });
    }

    if (type === "summary") {
      const stats = getPlatformStats();
      const headers = ["Metric", "Value", "Source", "Updated_At"];
      const rows = [
        ["Total Platform Cases", stats.totalCases, "DengueShield Surveillance", stats.lastUpdated],
        ["Active Cases", stats.activeCases, "DengueShield Surveillance", stats.lastUpdated],
        ["Confirmed Cases", stats.confirmedCases, "Verified Laboratory Feed", stats.lastUpdated],
        ["Suspected Cases", stats.suspectedCases, "Clinical Triage Submissions", stats.lastUpdated],
        ["Recovered Cases", stats.recoveredCases, "Clinical Follow-ups", stats.lastUpdated],
        ["Reported Deaths", stats.deaths, "Verified Mortality Registry", stats.lastUpdated],
        ["Verified Breeding Reports", stats.verifiedReports, "Municipal Field Verification", stats.lastUpdated],
        ["Pending Breeding Reports", stats.pendingReports, "Community Submissions", stats.lastUpdated],
      ].map(row => row.map(formatCSVCell).join(","));

      const csv = [
        `# DengueShield Executive Surveillance Summary`,
        `# Generated: ${new Date().toISOString()}`,
        headers.join(","),
        ...rows
      ].join("\n");

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="dengueshield_summary_${timestamp}.csv"`,
        },
      });
    }

    return Response.json({ error: "Invalid export type." }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "Failed to generate CSV export." }, { status: 500 });
  }
}
