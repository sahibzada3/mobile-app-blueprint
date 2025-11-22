import { type AdvancedSettings } from "@/types/camera";

export type FilterType =
  | "golden-hour-glow"
  | "moody-forest"
  | "cloud-pop"
  | "silhouette-glow"
  | "cinematic-teal-orange"
  | "soft-dreamy"
  | "night-clarity"
  | "nature-boost";

export const filterPresets: Record<FilterType, Partial<AdvancedSettings>> = {
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
  "cloud-pop": {
    contrast: 115,
    saturation: 110,
    highlights: 15,
    clarity: 20,
    dehaze: 10,
  },
  "silhouette-glow": {
    brightness: 95,
    contrast: 125,
    temperature: 25,
    shadows: -30,
    highlights: 15,
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
  "nature-boost": {
    saturation: 125,
    greenBoost: 30,
    clarity: 15,
    texture: 10,
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
