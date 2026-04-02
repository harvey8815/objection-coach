// Netlify Serverless Function — Objection Coach AI Proxy
// This function securely holds your Anthropic API key on the server
// so it never gets exposed in the browser.

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // CORS headers — allows your frontend to call this function
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

    // Build the system prompt using the business profile
    const profile = businessProfile || {};
    const systemLines = [
      "You are an expert sales coach giving real-time rebuttal suggestions to a sales rep on a live cold call.",
      "",
      "PRODUCT BEING PITCHED: " + (productName || "our product") + " — " + (productDesc || "our service"),
      profile.name ? "COMPANY NAME: " + profile.name : "",
      profile.offer ? "WHAT THEY SELL: " + profile.offer : "",
      profile.valueProp ? "VALUE PROP: " + profile.valueProp : "",
      profile.targetCustomer ? "TARGET CUSTOMER: " + profile.targetCustomer : "",
      "",
      "Your job: Analyze the prospect's latest statement and generate the perfect rebuttal.",
      "",
      'Respond ONLY with valid JSON, no markdown, no extra text:',
      '{"objectionType":"Dismissive|Budget|Timing|Existing Solution|Decision|Stalling|Trust","rebuttal":"exact words rep should say — 2-4 sentences, conversational, ends with a question to keep them talking","tip":"one coaching tip on HOW to deliver this — tone, pace, energy","tipIcon":"one relevant emoji"}',
      "",
      "Rules:",
      "- Sound human, not scripted",
      "- Acknowledge their concern first — never be defensive",
      "- Pivot to value or genuine curiosity",
      "- Always end with an open-ended question",
      "- Keep it under 60 words total"
    ].filter(Boolean).join("\n");

    const userMessage = [
      context ? "RECENT CALL CONTEXT:\n" + context : "",
      "",
      'PROSPECT JUST SAID: "' + segmentText + '"',
      "",
      "Generate the perfect rebuttal for this exact moment."
    ].filter(Boolean).join("\n");

    // Call Anthropic API using the environment variable set in Netlify dashboard
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", // Fast + cheap — perfect for real-time rebuttals
        max_tokens: 300,
        system: systemLines.join("\n"),
        messages: [{ role: "user", content: userMessage }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: "API error: " + response.status })
      };
    }

    const data = await response.json();
    const raw = data?.content?.[0]?.text || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      // If JSON parse fails, return a safe fallback
      parsed = {
        objectionType: "General",
        rebuttal: "I hear you — can I ask one quick question before you go? What would need to be true for this to even be worth a 2-minute conversation?",
        tip: "Stay calm. Curiosity beats pressure every time.",
        tipIcon: "🎯"
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal error: " + err.message })
    };
  }
};
