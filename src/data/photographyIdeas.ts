export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type IdeaCategory = "technique" | "location" | "weather" | "composition" | "lighting" | "equipment";

export interface PhotographyIdea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  difficulty: DifficultyLevel;
  tips: string[];
  bestTime?: string;
  weatherConditions?: string[];
  equipment?: string[];
  imagePrompt?: string;
}

export const photographyIdeas: PhotographyIdea[] = [
  // Composition Techniques
  {
    id: "rule-of-thirds",
    title: "Rule of Thirds",
    description: "Divide your frame into a 3x3 grid and place key elements along the lines or at their intersections for balanced, visually appealing compositions.",
    category: "composition",
    difficulty: "beginner",
    tips: [
      "Align horizons with the top or bottom third line",
      "Place subjects at intersection points for emphasis",
      "Leave space in the direction your subject is facing",
      "Use grid overlay on your camera for accuracy"
    ],
    bestTime: "Any time of day",
  },
  {
    id: "leading-lines",
    title: "Leading Lines",
    description: "Use natural or man-made lines to guide the viewer's eye through the photograph toward your main subject.",
    category: "composition",
    difficulty: "beginner",
    tips: [
      "Look for roads, rivers, fences, or tree lines",
      "Position lines to lead toward your focal point",
      "Diagonal lines create more dynamic images",
      "Converging lines add depth and perspective"
    ],
    bestTime: "Any time, especially golden hour for shadows",
  },
  {
    id: "golden-triangle",
    title: "Golden Triangle Composition",
    description: "An advanced compositional technique using diagonal lines from corners to create dynamic tension and natural eye movement.",
    category: "composition",
    difficulty: "advanced",
    tips: [
      "Draw imaginary diagonal from corner to corner",
      "Perpendicular lines from other corners create triangles",
      "Place key elements along these diagonal lines",
      "Creates more dynamic feel than rule of thirds"
    ],
    bestTime: "Any time of day",
  },
  
  // Lighting Techniques
  {
    id: "golden-hour",
    title: "Golden Hour Photography",
    description: "Capture the warm, soft light during the first hour after sunrise and last hour before sunset for magical, cinematic results.",
    category: "lighting",
    difficulty: "beginner",
    tips: [
      "Arrive 30 minutes before golden hour starts",
      "Shoot with the sun at your side for dimension",
      "Use backlighting for silhouettes and rim light",
      "White balance on 'Cloudy' for warmer tones"
    ],
    bestTime: "First hour after sunrise, last hour before sunset",
    weatherConditions: ["Clear", "Partly Cloudy"],
  },
  {
    id: "blue-hour",
    title: "Blue Hour Magic",
    description: "The period of twilight when the sun is below the horizon creates a deep blue sky perfect for urban and landscape photography.",
    category: "lighting",
    difficulty: "intermediate",
    tips: [
      "Occurs 20-40 minutes after sunset or before sunrise",
      "Use tripod for longer exposures",
      "Balance ambient light with artificial lights",
      "Shoot in RAW for better color control"
    ],
    bestTime: "20-40 minutes after sunset or before sunrise",
    weatherConditions: ["Clear", "Partly Cloudy"],
    equipment: ["Tripod", "Remote shutter"],
  },
  {
    id: "backlight-silhouettes",
    title: "Backlight Silhouettes",
    description: "Position your subject between the camera and a strong light source to create dramatic silhouette effects.",
    category: "lighting",
    difficulty: "beginner",
    tips: [
      "Shoot during golden hour or blue hour",
      "Expose for the bright background, not subject",
      "Choose subjects with distinctive shapes",
      "Clean backgrounds work best for silhouettes"
    ],
    bestTime: "Sunrise or sunset",
    weatherConditions: ["Clear"],
  },
  
  // Weather-Based
  {
    id: "fog-mystery",
    title: "Foggy Morning Mystique",
    description: "Use fog and mist to create atmospheric, dreamy photographs with reduced depth and soft, diffused lighting.",
    category: "weather",
    difficulty: "intermediate",
    tips: [
      "Shoot early morning when fog is thickest",
      "Increase exposure compensation by 1-2 stops",
      "Include dark subjects for contrast",
      "Look for layers of fog at different distances"
    ],
    bestTime: "Early morning",
    weatherConditions: ["Fog", "Mist"],
  },
  {
    id: "rain-reflections",
    title: "Rain & Reflections",
    description: "Transform rainy days into opportunities by capturing reflections in puddles, wet surfaces, and rain-soaked environments.",
    category: "weather",
    difficulty: "beginner",
    tips: [
      "Protect your camera with rain sleeve or umbrella",
      "Shoot low to capture puddle reflections",
      "Include raindrops on windows or leaves",
      "Overcast sky acts as natural softbox"
    ],
    bestTime: "During or just after rain",
    weatherConditions: ["Rain", "Drizzle"],
    equipment: ["Rain protection", "Lens cloth"],
  },
  {
    id: "storm-drama",
    title: "Storm Drama",
    description: "Capture the raw power and drama of approaching storms, lightning, and dramatic cloud formations.",
    category: "weather",
    difficulty: "advanced",
    tips: [
      "Safety first - maintain safe distance",
      "Use tripod for lightning shots",
      "Long exposures (10-30 seconds) to catch lightning",
      "Include landscape elements for scale"
    ],
    bestTime: "Before, during, or after storms",
    weatherConditions: ["Stormy", "Thunderstorm"],
    equipment: ["Tripod", "Remote shutter", "Rain protection"],
  },
  {
    id: "snow-scenes",
    title: "Snow Photography",
    description: "Master the unique challenges of photographing winter landscapes and snow-covered scenes.",
    category: "weather",
    difficulty: "intermediate",
    tips: [
      "Increase exposure by 1-2 stops (snow looks gray otherwise)",
      "Shoot in RAW for better white balance control",
      "Include color elements for contrast",
      "Protect gear from moisture and cold"
    ],
    bestTime: "Early morning for fresh snow",
    weatherConditions: ["Snow", "Cloudy"],
    equipment: ["Lens hood", "Battery extras"],
  },
  
  // Location-Based
  {
    id: "forest-light",
    title: "Forest Light Beams",
    description: "Capture magical light rays filtering through forest canopy, creating ethereal atmosphere in woodland settings.",
    category: "location",
    difficulty: "intermediate",
    tips: [
      "Best on foggy or misty mornings",
      "Shoot when sun is low (early morning)",
      "Underexpose slightly to emphasize beams",
      "Dense forests with gaps work best"
    ],
    bestTime: "Early morning, especially misty days",
    weatherConditions: ["Fog", "Mist", "Partly Cloudy"],
  },
  {
    id: "waterfall-smooth",
    title: "Silky Waterfall Effect",
    description: "Use long exposures to transform flowing water into smooth, silky cascades with dreamy motion blur.",
    category: "location",
    difficulty: "intermediate",
    tips: [
      "Use 1-4 second exposure for silky effect",
      "Neutral density (ND) filter for daytime shooting",
      "Tripod is absolutely essential",
      "Shoot in shade or on overcast days"
    ],
    bestTime: "Overcast days or shade",
    weatherConditions: ["Cloudy", "Any"],
    equipment: ["Tripod", "ND filter", "Remote shutter"],
  },
  {
    id: "mountain-layers",
    title: "Mountain Layers",
    description: "Stack multiple mountain ridges in your frame to create depth through atmospheric perspective and layering.",
    category: "location",
    difficulty: "beginner",
    tips: [
      "Shoot from elevated viewpoints",
      "Misty or hazy conditions enhance layers",
      "Use telephoto lens to compress perspective",
      "Early morning or late evening light works best"
    ],
    bestTime: "Golden hour or blue hour",
    weatherConditions: ["Clear", "Hazy", "Partly Cloudy"],
    equipment: ["Telephoto lens"],
  },
  {
    id: "coastal-long-exposure",
    title: "Coastal Long Exposure",
    description: "Transform ocean waves into ethereal mist using long exposure techniques at beaches and rocky coastlines.",
    category: "location",
    difficulty: "advanced",
    tips: [
      "30 seconds to several minutes for misty water",
      "Use strong ND filter (6-10 stops)",
      "Include rocks or structures as anchors",
      "Clean sensor regularly (salty air)"
    ],
    bestTime: "Blue hour or overcast days",
    weatherConditions: ["Any", "Cloudy"],
    equipment: ["Strong ND filter", "Tripod", "Lens cloth"],
  },
  {
    id: "urban-geometry",
    title: "Urban Geometry",
    description: "Find patterns, symmetry, and geometric shapes in cityscapes, architecture, and urban environments.",
    category: "location",
    difficulty: "beginner",
    tips: [
      "Look for repeating patterns and lines",
      "Shoot from unusual angles (low or high)",
      "Include people for scale",
      "Modern architecture offers best opportunities"
    ],
    bestTime: "Blue hour for city lights",
    weatherConditions: ["Any"],
  },
  
  // Advanced Techniques
  {
    id: "star-trails",
    title: "Star Trails",
    description: "Create circular star trail patterns through long exposures of the night sky, revealing Earth's rotation.",
    category: "technique",
    difficulty: "advanced",
    tips: [
      "Find location away from light pollution",
      "Point camera north to capture circular trails",
      "Take multiple 30-second exposures and stack",
      "Use wide aperture (f/2.8 or wider)"
    ],
    bestTime: "Clear nights, new moon phase",
    weatherConditions: ["Clear"],
    equipment: ["Tripod", "Wide lens", "Intervalometer"],
  },
  {
    id: "panorama-stitching",
    title: "Panoramic Landscapes",
    description: "Capture ultra-wide landscapes by taking multiple overlapping shots and stitching them together.",
    category: "technique",
    difficulty: "intermediate",
    tips: [
      "Overlap each shot by 30-40%",
      "Use manual mode for consistent exposure",
      "Lock focus and white balance",
      "Keep camera level with panoramic head"
    ],
    bestTime: "Any time of day",
    weatherConditions: ["Any"],
    equipment: ["Tripod", "Panoramic head (optional)"],
  },
  {
    id: "foreground-framing",
    title: "Foreground Framing",
    description: "Use natural elements in the foreground to frame your main subject and add depth to your compositions.",
    category: "composition",
    difficulty: "intermediate",
    tips: [
      "Tree branches, archways, windows make great frames",
      "Use small aperture (f/11-f/16) for sharpness throughout",
      "Frame should complement, not compete with subject",
      "Create depth by including multiple layers"
    ],
    bestTime: "Any time of day",
  },
  {
    id: "macro-nature",
    title: "Macro Nature Details",
    description: "Get up close to capture intricate details of flowers, insects, water droplets, and small natural subjects.",
    category: "technique",
    difficulty: "intermediate",
    tips: [
      "Use macro lens or extension tubes",
      "Steady yourself or use tripod",
      "Shoot in shade for even lighting",
      "Focus on eyes for insects"
    ],
    bestTime: "Morning for dew, afternoon for insects",
    weatherConditions: ["Cloudy", "Shade"],
    equipment: ["Macro lens", "Tripod", "Reflector"],
  },
  {
    id: "sunset-clouds",
    title: "Dramatic Sunset Clouds",
    description: "Capture vibrant, colorful sunsets with dramatic cloud formations for stunning landscape photography.",
    category: "lighting",
    difficulty: "beginner",
    tips: [
      "Arrive early to scout compositions",
      "Include foreground interest",
      "Use graduated ND filter to balance sky and land",
      "Stay after sunset for best colors"
    ],
    bestTime: "30 minutes before until 30 minutes after sunset",
    weatherConditions: ["Partly Cloudy", "Scattered Clouds"],
    equipment: ["Graduated ND filter (optional)"],
  },
];

export const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  const colors: Record<DifficultyLevel, string> = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };
  return colors[difficulty];
};

export const getCategoryIcon = (category: IdeaCategory): string => {
  const icons: Record<IdeaCategory, string> = {
    technique: "⚡",
    location: "📍",
    weather: "🌤️",
    composition: "🎨",
    lighting: "💡",
    equipment: "📷",
  };
  return icons[category];
};

export const getCategoryColor = (category: IdeaCategory): string => {
  const colors: Record<IdeaCategory, string> = {
    technique: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    location: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    weather: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    composition: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    lighting: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    equipment: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  };
  return colors[category];
};
