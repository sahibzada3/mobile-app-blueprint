export type CameraMode = 
  | "auto" 
  | "sky" 
  | "sun-ray" 
  | "silhouette" 
  | "golden-hour" 
  | "animal" 
  | "nature" 
  | "cinematic";

export type SceneType =
  | "sky"
  | "sunset"
  | "silhouette"
  | "trees"
  | "sun-rays"
  | "animal"
  | "low-light"
  | "fog"
  | "indoor";

export interface AdvancedSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  shadows: number;
  highlights: number;
  tint: number;
  temperature: number;
  clarity: number;
  dehaze: number;
  vignette: number;
  noiseReduction: number;
  greenBoost: number;
  texture: number;
}
