import { type AdvancedSettings } from "@/types/camera";

export type FilterType =
  | "cloud-pop"
  | "golden-hour-glow"
  | "moody-forest"
  | "nature-boost"
  | "cinematic-teal-orange"
  | "soft-dreamy"
  | "night-clarity"
  | "beam-enhancer"
  | "warm-silhouette"
  | "deep-shadows"
  | "water-blue-boost"
  | "hdr-sky-booster";

export const filterPresets: Record<FilterType, Partial<AdvancedSettings>> = {
  "cloud-pop": {
    contrast: 115,
    saturation: 110,
    highlights: 15,
    clarity: 20,
    dehaze: 10,
  },
  "golden-hour-glow": {
    brightness: 105,
    saturation: 120,
    temperature: 20,
    highlights: 10,
    shadows: -10,
  },
  "moody-forest": {
    brightness: 95,
    contrast: 110,
    saturation: 105,
    shadows: -15,
    greenBoost: 25,
    vignette: 15,
  },
  "nature-boost": {
    saturation: 125,
    greenBoost: 30,
    clarity: 15,
    texture: 10,
  },
  "cinematic-teal-orange": {
    contrast: 115,
    saturation: 110,
    temperature: 15,
    tint: -5,
    shadows: -10,
  },
  "soft-dreamy": {
    brightness: 105,
    contrast: 95,
    saturation: 105,
    highlights: 15,
    clarity: -10,
  },
  "night-clarity": {
    brightness: 115,
    shadows: 20,
    highlights: -10,
    noiseReduction: 20,
    clarity: 10,
  },
  "beam-enhancer": {
    contrast: 120,
    highlights: 20,
    clarity: 25,
    dehaze: -10,
  },
  "warm-silhouette": {
    brightness: 95,
    contrast: 125,
    temperature: 25,
    shadows: -30,
    highlights: 15,
  },
  "deep-shadows": {
    contrast: 125,
    shadows: -25,
    highlights: 10,
    vignette: 20,
  },
  "water-blue-boost": {
    saturation: 115,
    tint: -15,
    clarity: 15,
    dehaze: 10,
  },
  "hdr-sky-booster": {
    contrast: 120,
    saturation: 115,
    highlights: 20,
    shadows: 10,
    clarity: 20,
    dehaze: 15,
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

  return filters.join(" ");
}
