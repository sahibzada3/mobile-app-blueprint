import { serve } from "https://deno.land/x/sift/mod.ts";

// Example quotes by language
const quotesByLanguage: Record<string, string[]> = {
  en: ["Keep going!", "Believe in yourself!", "The best is yet to come."],
  es: ["¡Sigue adelante!", "¡Cree en ti mismo!", "Lo mejor está por venir."],
  fr: ["Continuez!", "Croyez en vous!", "Le meilleur est à venir."],
  de: ["Mach weiter!", "Glaube an dich selbst!", "Das Beste kommt noch."],
  it: ["Continua!", "Credi in te stesso!", "Il meglio deve ancora venire."],
  pt: ["Continue!", "Acredite em você mesmo!", "O melhor ainda está por vir."],
  ar: ["استمر!", "آمن بنفسك!", "الأفضل لم يأت بعد."],
  ur: ["جاری رکھیں!", "خود پر یقین رکھیں!", "بہترین ابھی آنا باقی ہے۔"],
  ps: ["پرله پسې!", "په ځان باور وکړئ!", "تر ټولو ښه لا راتلونکی دی."],
  hi: ["जारी रखें!", "अपने आप पर विश्वास करें!", "सर्वोत्तम अभी आना बाकी है।"],
  zh: ["继续前进！", "相信自己！", "最好的还在后头。"],
  ja: ["頑張って！", "自分を信じて！", "最高のことはこれからです。"],
};

serve(async (req) => {
  try {
    const { scene, language } = await req.json();

    // Fallback to English if language not supported
    const quotes = quotesByLanguage[language] || quotesByLanguage["en"];

    // Optionally, you can randomize
    const shuffledQuotes = quotes.sort(() => Math.random() - 0.5);

    return new Response(JSON.stringify({ quotes: shuffledQuotes }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
