import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  demo?: boolean;
  org_id?: string;
  history?: { role: string; content: string }[];
}

const SCRIPTED: Record<string, string> = {
  greeting: "Hello! I'm Aria, your AI receptionist. I can answer questions about services, book appointments, and capture your details — 24/7, in any language. What can I help you with today?",
  pricing: "Our plans start at $49/month for the Starter tier, which includes one AI agent and 500 conversations. The Pro plan at $149/month adds multi-language support and calendar booking. Would you like me to connect you with our team for a custom quote?",
  hours: "I'm available 24 hours a day, 7 days a week — I never sleep, take breaks, or miss a call. Your human team's hours are 9am–5pm, but I handle everything outside that window too.",
  services: "I can answer FAQs, qualify leads, book appointments directly into your calendar, capture contact information, send follow-up emails, and even handle phone calls when connected to Twilio. Think of me as a full-time receptionist at a fraction of the cost.",
  book: "I'd be happy to book an appointment! I can see your team's calendar availability in real-time. Could you share your preferred date and time, and I'll find the nearest open slot and add it to the calendar.",
  default: "Great question! I'm a demo of THE 7 WORKFORCE AI receptionist. In a live deployment, I'd be connected to this business's knowledge base and could give you specific, accurate answers. Would you like to see how I handle appointment booking or lead capture?",
};

function scriptedReply(input: string): string {
  const lower = input.toLowerCase();
  if (/price|cost|plan|pricing|how much/.test(lower)) return SCRIPTED.pricing;
  if (/hour|open|close|available|when/.test(lower)) return SCRIPTED.hours;
  if (/service|do|feature|capab|help/.test(lower)) return SCRIPTED.services;
  if (/book|appointment|schedule|meeting/.test(lower)) return SCRIPTED.book;
  return SCRIPTED.default;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ChatRequest;
    const userMessage = body.message ?? "";
    if (!userMessage.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Demo mode: always scripted, never calls external APIs.
    if (body.demo) {
      return new Response(JSON.stringify({ reply: scriptedReply(userMessage), provider: "scripted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Non-demo: look up the org's AI provider + credentials from DB.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    let provider = "scripted";
    let apiKey: string | undefined;
    let systemPrompt = "You are Aria, a professional AI receptionist. Be concise, friendly, and helpful. Answer questions about the business, capture leads, and offer to book appointments.";

    if (body.org_id) {
      const { data: orgIntegrations } = await supabase
        .from("integrations")
        .select("provider, credentials_encrypted, metadata")
        .eq("org_id", body.org_id)
        .eq("status", "connected");

      const openai = orgIntegrations?.find((i) => i.provider === "openai");
      const gemini = orgIntegrations?.find((i) => i.provider === "gemini");

      if (openai?.credentials_encrypted) {
        provider = "openai";
        apiKey = openai.credentials_encrypted; // decrypted in a real system
      } else if (gemini?.credentials_encrypted) {
        provider = "gemini";
        apiKey = gemini.credentials_encrypted;
      }

      const { data: agent } = await supabase
        .from("ai_agents")
        .select("*")
        .eq("org_id", body.org_id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (agent) {
        const parts = [
          agent.greeting ? `Greeting: ${agent.greeting}` : null,
          agent.business_description ? `Business: ${agent.business_description}` : null,
          agent.services ? `Services: ${agent.services}` : null,
          agent.hours ? `Hours: ${agent.hours}` : null,
          agent.personality ? `Personality: ${agent.personality}` : null,
        ].filter(Boolean);
        if (parts.length) systemPrompt = `You are ${agent.name}, a professional AI receptionist.\n${parts.join("\n")}\nBe concise, friendly, and helpful. Respond in ${agent.language || "English"}.`;
      }
    }

    let reply = "";

    if (provider === "openai" && apiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...(body.history ?? []).map((h) => ({ role: h.role, content: h.content })),
            { role: "user", content: userMessage },
          ],
          max_tokens: 300,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        reply = data.choices?.[0]?.message?.content ?? "";
      }
    } else if (provider === "gemini" && apiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }] }],
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      }
    }

    if (!reply) {
      reply = scriptedReply(userMessage);
      provider = "scripted";
    }

    return new Response(JSON.stringify({ reply, provider }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, reply: SCRIPTED.default, provider: "scripted" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
