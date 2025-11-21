export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type IdeaCategory = "technique" | "location" | "weather" | "composition" | "lighting" | "equipment";

// Import images
import mountainLandscape from "@/assets/ideas/mountain-landscape.jpg";
import forestLight from "@/assets/ideas/forest-light.jpg";
import sunsetGolden from "@/assets/ideas/sunset-golden.jpg";
import waterfall from "@/assets/ideas/waterfall.jpg";
import fogMystery from "@/assets/ideas/fog-mystery.jpg";
import coastalWaves from "@/assets/ideas/coastal-waves.jpg";
import nightStars from "@/assets/ideas/night-stars.jpg";
import rainReflections from "@/assets/ideas/rain-reflections.jpg";
import ruleOfThirds from "@/assets/ideas/rule-of-thirds.jpg";
import leadingLines from "@/assets/ideas/leading-lines.jpg";
import goldenTriangle from "@/assets/ideas/golden-triangle.jpg";
import blueHour from "@/assets/ideas/blue-hour.jpg";
import backlightSilhouettes from "@/assets/ideas/backlight-silhouettes.jpg";
import stormDrama from "@/assets/ideas/storm-drama.jpg";
import snowScenes from "@/assets/ideas/snow-scenes.jpg";
import urbanGeometry from "@/assets/ideas/urban-geometry.jpg";
import panorama from "@/assets/ideas/panorama.jpg";
import macroNature from "@/assets/ideas/macro-nature.jpg";
import sunsetClouds from "@/assets/ideas/sunset-clouds.jpg";
import foregroundFraming from "@/assets/ideas/foreground-framing.jpg";

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
  imageUrl?: string;
  tutorial?: {
    step: number;
    title: string;
    instruction: string;
  }[];
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
    imageUrl: ruleOfThirds,
    tutorial: [
      { step: 1, title: "Enable Grid Overlay", instruction: "Turn on the grid display in your camera settings to see the rule of thirds lines." },
      { step: 2, title: "Position Your Subject", instruction: "Place your main subject at one of the four intersection points where the lines cross." },
      { step: 3, title: "Align the Horizon", instruction: "If shooting landscapes, align the horizon with either the top or bottom third line, not the center." },
      { step: 4, title: "Leave Breathing Room", instruction: "Give space in the direction your subject is facing or moving for a more natural composition." },
      { step: 5, title: "Take the Shot", instruction: "Review your image and adjust positioning if needed to ensure key elements follow the grid." }
    ],
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
    imageUrl: leadingLines,
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
    imageUrl: goldenTriangle,
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
    imageUrl: sunsetGolden,
    tutorial: [
      { step: 1, title: "Check Golden Hour Time", instruction: "Use a weather app to find exact sunrise/sunset times. Arrive 30 minutes early to set up." },
      { step: 2, title: "Scout Your Location", instruction: "Walk around to find the best angle. Look for interesting foreground elements to add depth." },
      { step: 3, title: "Set Camera Settings", instruction: "Start with Manual mode: ISO 100-400, aperture f/8-f/11 for landscapes, shutter speed 1/125s." },
      { step: 4, title: "Position Yourself", instruction: "Stand with the sun to your side or behind your subject for warm rim lighting and dimensional shadows." },
      { step: 5, title: "Shoot Multiple Exposures", instruction: "Take several shots as light changes rapidly. Adjust exposure compensation as needed." }
    ],
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
    imageUrl: blueHour,
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
    imageUrl: backlightSilhouettes,
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
    imageUrl: fogMystery,
    tutorial: [
      { step: 1, title: "Check Weather Forecast", instruction: "Look for cool, humid mornings. Fog forms when temperature and dew point are close." },
      { step: 2, title: "Arrive Before Dawn", instruction: "Get to location while it is still dark. Fog is thickest just after sunrise." },
      { step: 3, title: "Increase Exposure", instruction: "Fog tricks your camera meter. Add +1 to +2 exposure compensation to avoid gray fog." },
      { step: 4, title: "Find Dark Subjects", instruction: "Look for trees, buildings, or people as dark silhouettes against the bright fog for contrast." },
      { step: 5, title: "Capture Layers", instruction: "Position yourself to show multiple fog layers at different distances for depth and mystery." }
    ],
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
    imageUrl: rainReflections,
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
    imageUrl: stormDrama,
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
    imageUrl: snowScenes,
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
    imageUrl: forestLight,
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
    imageUrl: waterfall,
    tutorial: [
      { step: 1, title: "Set Up Your Tripod", instruction: "Place tripod on stable ground. Make sure it is level and won't move during exposure." },
      { step: 2, title: "Attach ND Filter", instruction: "Screw on a 3-6 stop ND filter to reduce light. This allows longer exposures in daylight." },
      { step: 3, title: "Set Manual Mode", instruction: "Switch to Manual: ISO 100, aperture f/11-f/16 for sharpness, then adjust shutter speed." },
      { step: 4, title: "Calculate Exposure", instruction: "Start with 1-4 second shutter speed. Use a remote or timer to avoid camera shake." },
      { step: 5, title: "Compose and Shoot", instruction: "Frame waterfall with surrounding rocks or foliage. Take test shots and adjust shutter speed for silkiness." }
    ],
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
    imageUrl: mountainLandscape,
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
    imageUrl: coastalWaves,
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
    imageUrl: urbanGeometry,
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
    imageUrl: nightStars,
    tutorial: [
      { step: 1, title: "Find Dark Location", instruction: "Drive away from city lights. Use a light pollution map to find the darkest spot within reach." },
      { step: 2, title: "Set Up Equipment", instruction: "Mount camera on sturdy tripod. Attach wide-angle lens (14-24mm) and intervalometer." },
      { step: 3, title: "Configure Camera", instruction: "Manual mode: ISO 800-1600, aperture f/2.8-f/4, shutter 25-30 seconds. Set intervalometer for 200+ shots." },
      { step: 4, title: "Point North", instruction: "Use compass app to aim camera north (northern hemisphere) to capture circular star trails around Polaris." },
      { step: 5, title: "Start Sequence", instruction: "Start intervalometer and let it run for 1-3 hours. Use software to stack images into star trails." }
    ],
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
    imageUrl: panorama,
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
    imageUrl: foregroundFraming,
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
    imageUrl: macroNature,
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
    imageUrl: sunsetClouds,
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
    technique: "Zap",
    location: "MapPin",
    weather: "Cloud",
    composition: "Palette",
    lighting: "Sun",
    equipment: "Camera",
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
