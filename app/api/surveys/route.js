import { getSurveys, submitSurveyResponse } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const surveys = getSurveys();
    const activeSurvey = surveys[0] || null;

    if (!activeSurvey) {
      return Response.json({ survey: null, analytics: null });
    }

    // Compute aggregated response analytics
    const responses = activeSurvey.responses || [];
    const totalResponses = responses.length;
    const analytics = {};

    for (const q of activeSurvey.questions || []) {
      analytics[q.id] = {};
      for (const opt of q.options || []) {
        analytics[q.id][opt] = 0;
      }
    }

    for (const r of responses) {
      if (r.answers && typeof r.answers === "object") {
        for (const [qId, ans] of Object.entries(r.answers)) {
          if (analytics[qId] && analytics[qId][ans] !== undefined) {
            analytics[qId][ans]++;
          }
        }
      }
    }

    return Response.json({ survey: activeSurvey, totalResponses, analytics });
  } catch (err) {
    return Response.json({ error: "Failed to load survey data." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.surveyId || !body.answers) {
      return Response.json({ error: "Survey ID and answers are required." }, { status: 400 });
    }

    const recorded = submitSurveyResponse(body.surveyId, {
      location: body.location || "West Bengal",
      district: body.district || "Kolkata",
      answers: body.answers,
    });

    if (!recorded) {
      return Response.json({ error: "Survey not found." }, { status: 404 });
    }

    return Response.json({ success: true, response: recorded }, { status: 201 });
  } catch (err) {
    return Response.json({ error: "Failed to record survey response." }, { status: 500 });
  }
}
