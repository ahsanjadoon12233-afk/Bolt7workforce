import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ContactBody {
  name: string;
  email: string;
  company?: string;
  country?: string;
  message: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ContactBody;
    if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
      return new Response(JSON.stringify({ error: "Name, email, and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Store as a lead in a dedicated "platform" org if one exists; otherwise just log.
    // For now we insert into audit_logs as a contact inquiry (no org required).
    const { error } = await supabase.from("audit_logs").insert({
      action: "contact_form_submission",
      entity: "contact",
      details: {
        name: body.name,
        email: body.email,
        company: body.company ?? null,
        country: body.country ?? null,
        message: body.message,
      },
    });

    if (error) {
      return new Response(JSON.stringify({ error: "Could not store inquiry" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If Resend is configured, send a notification email (best-effort).
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: "THE 7 WORKFORCE <onboarding@resend.dev>",
            to: "hello@the7workforce.com",
            subject: `New inquiry from ${body.name}`,
            text: `Name: ${body.name}\nEmail: ${body.email}\nCompany: ${body.company ?? "—"}\nCountry: ${body.country ?? "—"}\n\n${body.message}`,
          }),
        });
      } catch {
        // email is best-effort; don't fail the request
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
