// supabase/functions/generatequote/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    // Ensure it's a POST request
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST requests allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Parse request body
    const { scene, language } = await req.json();

    // Example quotes per language (you can expand)
    const quotesByLanguage: Record<string, string[]> = {
      en: ["Keep going!", "Believe in yourself!", "The best is yet to come."],
      es: ["¡Sigue adelante!", "Cree en ti mismo!", "Lo mejor está por venir."],
      fr: ["Continuez!", "Croyez en vous!", "Le meilleur est à venir."],
      de: ["Mach weiter!", "Glaub an dich!", "Das Beste kommt noch."],
      it: ["Continua!", "Credi in te stesso!", "Il meglio deve ancora venire."],
      pt: ["Continue!", "Acredite em si mesmo!", "O melhor ainda está por vir."],
      ar: ["استمر!", "آمن بنفسك!", "الأفضل لم يأت بعد."],
      ur: ["جاری رکھو!", "خود پر یقین رکھو!", "سب سے بہتر ابھی آنا باقی ہے۔"],
      hi: ["जारी रखो!", "खुद पर विश्वास करो!", "सबसे अच्छा अभी बाकी है।"],
      zh: ["继续前进！", "相信自己！", "最好的还在后面。"],
      ja: ["続けて！", "自分を信じて！", "最高のものはまだ来ていない。"],
    };

    const quotes = quotesByLanguage[language] || quotesByLanguage["en"];

    return new Response(JSON.stringify({ quotes }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate quotes" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
