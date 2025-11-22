import { type AdvancedSettings } from "@/types/camera";

export type FilterType =
  | "golden-hour"
  | "midday-sun"
  | "night"
  | "fog-mist"
  | "silhouette"
  | "urban"
  | "water"
  | "forest"
  | "beach-desert"
  | "sky-clouds"
  | "rain"
  | "indoor-golden"
  | "old-architecture";

export const filterPresets: Record<FilterType, Partial<AdvancedSettings>> = {
  "golden-hour": {
    brightness: 105,
    contrast: 95,
    saturation: 110,
    temperature: 15,
    shadows: 10,
    highlights: -5,
    tint: 5,
  },
  "midday-sun": {
    brightness: 110,
    contrast: 115,
    saturation: 105,
    clarity: 15,
    dehaze: 10,
    shadows: -10,
    highlights: -15,
  },
  "night": {
    brightness: 115,
    contrast: 110,
    saturation: 95,
    shadows: 20,
    clarity: 10,
    noiseReduction: 20,
    temperature: -5,
  },
  "fog-mist": {
    brightness: 105,
    contrast: 85,
    saturation: 90,
    dehaze: -15,
    clarity: -10,
    temperature: 5,
    vignette: 5,
  },
  "silhouette": {
    brightness: 95,
    contrast: 130,
    saturation: 95,
    shadows: -30,
    highlights: 15,
    clarity: 15,
  },
  "urban": {
    brightness: 100,
    contrast: 115,
    saturation: 105,
    clarity: 20,
    texture: 15,
    temperature: 10,
    tint: -5,
  },
  "water": {
    brightness: 105,
    contrast: 100,
    saturation: 110,
    clarity: 10,
    temperature: -5,
    tint: -10,
    shadows: 5,
  },
  "forest": {
    brightness: 100,
    contrast: 105,
    saturation: 120,
    greenBoost: 25,
    shadows: 10,
    clarity: 5,
    texture: 10,
  },
  "beach-desert": {
    brightness: 110,
    contrast: 110,
    saturation: 105,
    clarity: 15,
    dehaze: 15,
    temperature: 10,
    highlights: -10,
  },
  "sky-clouds": {
    brightness: 105,
    contrast: 120,
    saturation: 110,
    clarity: 20,
    dehaze: 20,
    highlights: -15,
    shadows: 10,
  },
  "rain": {
    brightness: 95,
    contrast: 110,
    saturation: 95,
    clarity: 15,
    temperature: -10,
    vignette: 10,
    shadows: 15,
  },
  "indoor-golden": {
    brightness: 110,
    contrast: 95,
    saturation: 105,
    temperature: 20,
    shadows: 15,
    tint: 5,
    vignette: -5,
  },
  "old-architecture": {
    brightness: 98,
    contrast: 115,
    saturation: 95,
    temperature: 8,
    texture: 20,
    clarity: 10,
    vignette: 15,
    tint: -3,
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
