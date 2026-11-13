import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const key = (body.key || "").trim();

    if (!key) {
      return Response.json({ error: "Please provide a valid Gemini API key." }, { status: 400 });
    }

    // Verify key against Gemini API with fallback models
    const candidateModels = [
      "gemini-3.5-flash",
      "gemini-flash-lite-latest",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-3.8-flash",
    ];
    let workingModel = null;
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const testResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
          signal: AbortSignal.timeout(7000),
        });

        // 200 = success, 429/503 = authenticated key but quota/busy
        if (testResponse.ok || testResponse.status === 429 || testResponse.status === 503) {
          workingModel = model;
          break;
        } else {
          const err = await testResponse.json().catch(() => ({}));
          lastError = err.error?.message || "Model verification failed.";
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!workingModel) {
      return Response.json({ error: lastError || "Invalid Gemini API key. Please check your key from Google AI Studio." }, { status: 400 });
    }

    // Set in-memory environment variables immediately
    process.env.GEMINI_API_KEY = key;
    process.env.GEMINI_LIVE_MODEL = workingModel;

    // Persist to .env.local
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      let content = "";
      if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, "utf-8");
      }
      if (content.includes("GEMINI_API_KEY=")) {
        content = content.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${key}`);
      } else {
        content += `\nGEMINI_API_KEY=${key}\n`;
      }
      if (content.includes("GEMINI_LIVE_MODEL=")) {
        content = content.replace(/GEMINI_LIVE_MODEL=.*/, `GEMINI_LIVE_MODEL=${workingModel}`);
      } else {
        content += `GEMINI_LIVE_MODEL=${workingModel}\n`;
      }
      fs.writeFileSync(envPath, content.trim() + "\n", "utf-8");
    } catch (fsErr) {
      console.warn("Could not write .env.local:", fsErr);
    }

    return Response.json({
      success: true,
      model: workingModel,
      message: `Google Gemini AI Agent connected successfully using ${workingModel}!`,
    });
  } catch (err) {
    return Response.json({ error: err.message || "Failed to verify API key." }, { status: 500 });
  }
}

