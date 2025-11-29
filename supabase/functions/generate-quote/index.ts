export async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await req.json();
  const { scene, language } = body;

  const quotesByLanguage: Record<string, string[]> = {
    en: ["The sun sets, the day ends.", "Life is a journey, embrace it."],
    es: ["El sol se pone, el día termina.", "La vida es un viaje, disfrútalo."],
    fr: ["Le soleil se couche, la journée se termine.", "La vie est un voyage, profitez-en."],
    ar: ["تغرب الشمس، وتنتهي النهار.", "الحياة رحلة، استمتع بها."],
    ur: ["سورج غروب ہوتا ہے، دن ختم ہو جاتا ہے۔", "زندگی ایک سفر ہے، لطف اٹھائیں۔"],
    hi: ["सूरज ढलता है, दिन समाप्त होता है।", "जीवन एक यात्रा है, इसका आनंद लें।"],
    zh: ["太阳落下，白天结束。", "生活是一段旅程，尽情享受。"],
    ja: ["太陽が沈み、日が終わる。", "人生は旅です、それを楽しんでください।"],
  };

  const quotes = quotesByLanguage[language] || quotesByLanguage["en"];

  return new Response(JSON.stringify({ quotes }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

