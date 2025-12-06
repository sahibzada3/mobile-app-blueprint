import { type AdvancedSettings } from "@/types/camera";

export type FilterType =
  | "solflare"
  | "emberkiss"
  | "cloudmatte"
  | "mosstone"
  | "breezeblue"
  | "retroforge"
  | "oldfilm98"
  | "neonpulse"
  | "rainglow"
  | "midnightglass"
  | "dreammist"
  | "blushbloom"
  | "cineteal"
  | "noiredge"
  | "prismdrift";

export const filterPresets: Record<FilterType, Partial<AdvancedSettings>> = {
  // 🌅 Warm golden boost — perfect for sunsets, highlights, and warm glow
  solflare: {
    brightness: 108,
    contrast: 105,
    saturation: 115,
    temperature: 20,
    shadows: 5,
    highlights: 10,
    tint: 8,
  },
  // 🌅 Dreamy orange-gold tone — emotional + cinematic
  emberkiss: {
    brightness: 105,
    contrast: 95,
    saturation: 110,
    temperature: 25,
    shadows: 15,
    highlights: -5,
    tint: 12,
    vignette: 10,
  },
  // 🌧️ Cool matte tones — ideal for cloudy days, nature, soft vibe
  cloudmatte: {
    brightness: 102,
    contrast: 90,
    saturation: 85,
    temperature: -5,
    shadows: 10,
    highlights: -10,
    clarity: -5,
  },
  // 🌳 Green-rich nature filter — forests, mountains, greenery
  mosstone: {
    brightness: 100,
    contrast: 108,
    saturation: 120,
    greenBoost: 30,
    shadows: 8,
    clarity: 10,
    texture: 8,
  },
  // 🌊 Fresh blue-teal tone for sky, water, beach photos
  breezeblue: {
    brightness: 105,
    contrast: 105,
    saturation: 112,
    temperature: -15,
    tint: -10,
    clarity: 12,
    dehaze: 10,
  },
  // 🏛️ Vintage muted brown film — trendy for old buildings + retro photos
  retroforge: {
    brightness: 98,
    contrast: 110,
    saturation: 80,
    temperature: 15,
    shadows: -5,
    highlights: -8,
    vignette: 15,
    tint: 5,
  },
  // 🎞️ 90s film camera aesthetic — subtle grain + low saturation
  oldfilm98: {
    brightness: 100,
    contrast: 105,
    saturation: 75,
    temperature: 8,
    shadows: 5,
    highlights: -5,
    vignette: 12,
    noiseReduction: -10,
  },
  // 🌃 Neon blue/pink pop — best for night street, signs, lights
  neonpulse: {
    brightness: 105,
    contrast: 120,
    saturation: 130,
    temperature: -10,
    tint: 15,
    shadows: -15,
    highlights: 15,
    clarity: 20,
  },
  // 🌧️ Rainy wet-street highlight boost — trendy moody nightlife vibe
  rainglow: {
    brightness: 95,
    contrast: 115,
    saturation: 105,
    temperature: -8,
    shadows: 20,
    highlights: 10,
    clarity: 15,
    vignette: 8,
  },
  // 🌑 Cinematic dark street look — deep shadows, high clarity
  midnightglass: {
    brightness: 90,
    contrast: 125,
    saturation: 95,
    temperature: -5,
    shadows: -20,
    highlights: 5,
    clarity: 25,
    vignette: 15,
  },
  // 🌸 Soft pastel dreamy filter — Gen-Z aesthetic MUST have
  dreammist: {
    brightness: 110,
    contrast: 85,
    saturation: 90,
    temperature: 5,
    tint: 10,
    shadows: 15,
    highlights: -10,
    clarity: -15,
    dehaze: -10,
  },
  // 🍑 Light pink-peach warm tone — aesthetic lifestyle & portraits
  blushbloom: {
    brightness: 108,
    contrast: 95,
    saturation: 100,
    temperature: 12,
    tint: 15,
    shadows: 10,
    highlights: 5,
    vignette: -5,
  },
  // 🎬 Teal & orange movie-grade color — perfect cinematic filter
  cineteal: {
    brightness: 100,
    contrast: 115,
    saturation: 110,
    temperature: 10,
    tint: -15,
    shadows: -10,
    highlights: -5,
    clarity: 15,
  },
  // ⚫ Strong dramatic black & white — classic + artistic
  noiredge: {
    brightness: 100,
    contrast: 130,
    saturation: 0,
    shadows: -15,
    highlights: 10,
    clarity: 20,
    vignette: 20,
  },
  // 🌈 Creative rainbow prism — unique signature filter
  prismdrift: {
    brightness: 105,
    contrast: 110,
    saturation: 125,
    temperature: 5,
    tint: 8,
    shadows: 5,
    highlights: 5,
    clarity: 10,
  },
};

export function applyFilter(
  settings: AdvancedSettings,
  filter?: FilterType | null
): string {
  const activeSettings = filter
    ? { ...settings, ...filterPresets[filter] }
    : settings;

  const filters: string[] = [];

  // Basic adjustments
  if (activeSettings.brightness !== 100) {
    filters.push(`brightness(${activeSettings.brightness}%)`);
  }
  if (activeSettings.contrast !== 100) {
    filters.push(`contrast(${activeSettings.contrast}%)`);
  }
  if (activeSettings.saturation !== 100) {
    filters.push(`saturate(${activeSettings.saturation}%)`);
  }

  // Temperature and tint (simulated with hue-rotate and sepia)
  if (activeSettings.temperature !== 0) {
    const warmth = activeSettings.temperature > 0 ? activeSettings.temperature / 100 : 0;
    filters.push(`sepia(${warmth})`);
  }

  // Clarity (simulated with sharpness)
  if (activeSettings.clarity > 0) {
    const sharpness = 1 + (activeSettings.clarity / 100);
    filters.push(`contrast(${sharpness * 100}%)`);
  }

  // Grayscale for noir
  if (activeSettings.saturation === 0) {
    filters.push(`grayscale(1)`);
  }

  return filters.join(" ");
}
