export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  difficulty: "easy" | "medium" | "hard";
  icon: string;
  tips: string[];
  expiresAt: Date;
}

const today = new Date();
const endOfWeek = new Date(today);
endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

export const challenges: Challenge[] = [
  {
    id: "golden-hour",
    title: "Golden Hour Magic",
    description: "Capture a nature scene during golden hour (sunrise or sunset)",
    type: "daily",
    difficulty: "easy",
    icon: "🌅",
    tips: [
      "Shoot 30-60 minutes after sunrise or before sunset",
      "Position the sun at your back or side for warm, soft lighting",
      "Look for glowing edges on subjects (rim lighting)",
    ],
    expiresAt: new Date(today.setHours(23, 59, 59)),
  },
  {
    id: "reflection",
    title: "Mirror of Nature",
    description: "Find and photograph a natural reflection in water",
    type: "daily",
    difficulty: "medium",
    icon: "💧",
    tips: [
      "Still water creates the clearest reflections",
      "Try puddles, lakes, or calm rivers",
      "Get low to the ground for dramatic angles",
      "Include both the subject and its reflection",
    ],
    expiresAt: new Date(today.setHours(23, 59, 59)),
  },
  {
    id: "macro-detail",
    title: "Tiny Wonders",
    description: "Capture extreme close-up details of nature",
    type: "daily",
    difficulty: "hard",
    icon: "🔍",
    tips: [
      "Get as close as your camera allows while maintaining focus",
      "Look for textures, patterns, and small details",
      "Use natural light from the side for depth",
      "Keep very still to avoid blur",
    ],
    expiresAt: new Date(today.setHours(23, 59, 59)),
  },
  {
    id: "weather-mood",
    title: "Weather Story",
    description: "Capture the mood and atmosphere of today's weather conditions",
    type: "weekly",
    difficulty: "medium",
    icon: "🌦️",
    tips: [
      "Dramatic weather makes for compelling photos",
      "Use mist, fog, rain, or clouds to create atmosphere",
      "Look for weather-specific elements (raindrops, snow, fog layers)",
      "Adjust your camera's brightness to match the mood",
    ],
    expiresAt: endOfWeek,
  },
  {
    id: "leading-lines",
    title: "Natural Pathways",
    description: "Use natural lines to guide the viewer's eye through your composition",
    type: "weekly",
    difficulty: "easy",
    icon: "🛤️",
    tips: [
      "Look for rivers, paths, tree branches, or horizons",
      "Lines should lead to your main subject",
      "Diagonal lines create dynamic energy",
      "S-curves are particularly pleasing",
    ],
    expiresAt: endOfWeek,
  },
  {
    id: "minimalist",
    title: "Less is More",
    description: "Create a minimalist nature composition with negative space",
    type: "weekly",
    difficulty: "hard",
    icon: "⚪",
    tips: [
      "Choose a simple, isolated subject",
      "Use vast empty spaces (sky, water, fog)",
      "Keep the composition clean and uncluttered",
      "Let the subject breathe with space around it",
    ],
    expiresAt: endOfWeek,
  },
];
