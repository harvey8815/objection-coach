// Netlify Serverless Function — Objection Coach AI Proxy
const https = require("https");

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    const body = JSON.parse(event.body);
    const { segmentText, context, productName, productDesc, businessProfile } = body;

    if (!segmentText) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "segmentText required" }) };
    }

    const profile = businessProfile || {};

    const systemPrompt = [
      "You are an expert sales coach giving real-time rebuttal suggestions to a sales rep on a live cold call.",
      "",
      "PRODUCT BEING PITCHED: " + (productName || "our product") + " — " + (productDesc || "our service"),
      profile.name ? "COMPANY NAME: " + profile.name : null,
      profile.offer ? "WHAT THEY SELL: " + profile.offer : null,
      profile.valueProp ? "VALUE PROP: " + profile.valueProp : null,
      profile.targetCustomer ? "TARGET CUSTOMER: " + profile.targetCustomer : null,
      "",
      "Respond ONLY with valid JSON — no markdown, no explanation, no extra text:",
      "{\"objectionType\":\"Dismissive\",\"rebuttal\":\"exact words to say — 2-3 sentences ending with a question\",\"tip\":\"delivery coaching tip\",\"tipIcon\":\"emoji\"}",
      "",
      "Rules: Sound human. Acknowledge first. End with a question. Under 60 words."
    ].filter(Boolean).join("\n");

    const userMessage = [
      context ? "RECENT CONTEXT:\n" + context.slice(-400) : "",
      "PROSPECT SAID: \"" + segmentText + "\"",
      "Give the perfect rebuttal now."
    ].filter(Boolean).join("\n");

    const requestBody = JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }]
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(requestBody)
        }
      };
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", chunk => { data += chunk; });
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      });
      req.on("error", reject);
      req.write(requestBody);
      req.end();
    });

    const fallback = {
      objectionType: "General",
      rebuttal: "I hear you — before I let you go, can I ask one quick question? What would need to be true for something like this to even be worth a 2-minute look?",
      tip: "Stay calm. Curiosity beats pressure every time.",
      tipIcon: "🎯"
    };

    if (result.status !== 200) {
      console.error("Anthropic error:", result.status, result.body);
      return { statusCode: 200, headers, body: JSON.stringify(fallback) };
    }

    const data = JSON.parse(result.body);
    const raw = (data.content && data.content[0] && data.content[0].text) ? data.content[0].text : "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(clean); } catch (e) { parsed = fallback; }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };

  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        objectionType: "General",
        rebuttal: "I hear you — before I let you go, can I ask one quick question? What would need to be true for something like this to even be worth a 2-minute look?",
        tip: "Stay calm. Curiosity beats pressure every time.",
        tipIcon: "🎯"
      })
    };
  }
};
