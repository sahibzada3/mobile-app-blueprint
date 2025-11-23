// Filter-based photography guidance with mentor-style instructions

// Import filter images
import goldenHour from "@/assets/filters/golden-hour.jpg";
import fogMist from "@/assets/filters/fog-mist.jpg";
import forest from "@/assets/filters/forest.jpg";
import beachDesert from "@/assets/filters/beach-desert.jpg";
import middaySun from "@/assets/filters/midday-sun.jpg";
import night from "@/assets/filters/night.jpg";
import oldArchitecture from "@/assets/filters/old-architecture.jpg";
import rain from "@/assets/filters/rain.jpg";
import silhouette from "@/assets/filters/silhouette.jpg";
import skyClouds from "@/assets/filters/sky-clouds.jpg";
import urban from "@/assets/filters/urban.jpg";
import water from "@/assets/filters/water.jpg";

export interface FilterGuide {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  bestTime: string;
  weatherConditions: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  imageUrl: string;
  cameraSettings: {
    iso: string;
    aperture: string;
    shutterSpeed: string;
    whiteBalance?: string;
  };
  mentorTips: string[];
  stepByStep: {
    step: number;
    title: string;
    instruction: string;
    mentorAdvice: string;
  }[];
  commonMistakes: string[];
  proTechniques: string[];
}

export const filterGuides: FilterGuide[] = [
  {
    id: "golden-hour",
    name: "Golden Hour Magic",
    subtitle: "The photographer's favorite time",
    description: "Master the warm, golden light that occurs during the first hour after sunrise and the last hour before sunset. This is when nature provides the most flattering, cinematic light for your subjects.",
    bestTime: "First hour after sunrise, last hour before sunset",
    weatherConditions: ["Clear", "Partly Cloudy"],
    difficulty: "beginner",
    imageUrl: goldenHour,
    cameraSettings: {
      iso: "100-400",
      aperture: "f/5.6 - f/11",
      shutterSpeed: "1/125 - 1/500s",
      whiteBalance: "Cloudy or Shade (for warmer tones)"
    },
    mentorTips: [
      "Think of golden hour as your secret weapon - it makes everything look better instantly",
      "The light changes fast during this time, so work quickly and take multiple shots",
      "Don't just shoot at sunset - some of the best light happens 15 minutes after the sun dips below the horizon",
      "Position yourself so the light wraps around your subject, not directly behind them"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Scout and Arrive Early",
        instruction: "Get to your location 30-45 minutes before golden hour begins. Walk around to find the best angles.",
        mentorAdvice: "I always arrive early because the light changes rapidly. Use this time to test compositions without the pressure of losing the light. Look for how the sun will move across your scene."
      },
      {
        step: 2,
        title: "Set Your Camera Baseline",
        instruction: "Start with Manual mode: ISO 100-400, Aperture f/8, Shutter speed 1/250s. Switch to Aperture Priority if you're less experienced.",
        mentorAdvice: "These settings are your starting point, not your ending point. As the sun drops, you'll need to adjust. Watch your histogram - don't let the highlights blow out on the bright areas."
      },
      {
        step: 3,
        title: "Position for Side Lighting",
        instruction: "Stand perpendicular to the sun (90 degrees) so light hits your subject from the side, creating depth and dimension.",
        mentorAdvice: "Side lighting is magic. It reveals texture, creates shadows that add depth, and gives your images that three-dimensional quality. Backlighting works too, but master side light first."
      },
      {
        step: 4,
        title: "Compose with the Rule of Thirds",
        instruction: "Place your horizon on the upper or lower third line. Position your subject at intersection points.",
        mentorAdvice: "Don't center everything - it's boring. The rule of thirds is called a rule because it works. Once you master it, then you can break it intentionally for creative effect."
      },
      {
        step: 5,
        title: "Shoot Continuously as Light Changes",
        instruction: "Take photos every 2-3 minutes as the light transforms. Adjust exposure compensation as needed.",
        mentorAdvice: "The best shot often happens when you least expect it. The light can go from good to incredible in 60 seconds. Stay present, keep shooting, and review later."
      }
    ],
    commonMistakes: [
      "Arriving too late and missing the peak golden hour light",
      "Shooting directly into the sun without intention (unless going for silhouettes)",
      "Using auto white balance instead of warming up the scene",
      "Not adjusting exposure as light fades - your images will get darker"
    ],
    proTechniques: [
      "Bracket your exposures (+/-1 stop) to capture the full dynamic range",
      "Use a graduated ND filter to balance bright skies with darker foregrounds",
      "Try backlighting with a reflector to fill in shadows on your subject's face",
      "Experiment with lens flare by partially including the sun in your frame"
    ]
  },
  {
    id: "fog-mist",
    name: "Fog & Mist Photography",
    subtitle: "Creating ethereal, dreamlike scenes",
    description: "Learn to work with fog and mist to create atmospheric, mysterious photographs with layers of depth and a soft, diffused quality that transforms ordinary scenes into magical moments.",
    bestTime: "Early morning, 30 minutes before to 2 hours after sunrise",
    weatherConditions: ["Fog", "Mist", "High Humidity"],
    difficulty: "intermediate",
    imageUrl: fogMist,
    cameraSettings: {
      iso: "200-800",
      aperture: "f/5.6 - f/8",
      shutterSpeed: "1/125 - 1/250s",
      whiteBalance: "Auto or Cloudy"
    },
    mentorTips: [
      "Fog is deceptive - it fools your camera's meter into underexposing. Add +1 to +2 exposure compensation",
      "Look for dark subjects (trees, buildings, people) to contrast against the bright fog",
      "The thicker the fog, the more simplified your composition should be",
      "Fog creates natural layers - use them to show depth in your landscape"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Check Weather and Scout",
        instruction: "Look for mornings with high humidity and temperature drops. Scout locations with elevation changes the day before.",
        mentorAdvice: "Fog forms when temperature and dew point meet, usually in valleys or near water. I check weather apps for humidity above 90% and cool mornings. Rivers and lakes are fog magnets."
      },
      {
        step: 2,
        title: "Arrive in Darkness",
        instruction: "Get to your spot while it's still dark. Fog is thickest just after sunrise and can burn off quickly.",
        mentorAdvice: "I've lost countless shots by arriving 15 minutes late. Fog is temperamental - it can disappear fast. Set up in the dark so you're ready when the light comes."
      },
      {
        step: 3,
        title: "Overexpose by 1-2 Stops",
        instruction: "Use exposure compensation to add +1 to +2 stops. Check your histogram - fog should appear bright white, not gray.",
        mentorAdvice: "Your camera thinks fog is a gray card and will underexpose it. Don't trust what you see on the LCD in dim light. The histogram doesn't lie - push it right without clipping highlights."
      },
      {
        step: 4,
        title: "Find Dark Contrast Elements",
        instruction: "Look for silhouettes of trees, buildings, or people emerging from the fog to create contrast and interest.",
        mentorAdvice: "All white fog is boring. You need dark elements to create drama. A lone tree in fog tells a story. A fence disappearing into mist creates mystery. Contrast is everything here."
      },
      {
        step: 5,
        title: "Capture Multiple Fog Layers",
        instruction: "Position yourself to show layers of fog at different distances for added depth and atmosphere.",
        mentorAdvice: "Fog layers create depth - near, middle, and far. I look for elevated viewpoints where I can see fog at multiple distances. It's like painting with atmospheric perspective."
      }
    ],
    commonMistakes: [
      "Underexposing - letting fog appear gray instead of white",
      "Shooting too late after fog has started to burn off",
      "Composing without dark contrast elements",
      "Not protecting gear from moisture - wipe lens frequently"
    ],
    proTechniques: [
      "Use a polarizing filter to reduce glare and deepen colors in the fog",
      "Shoot in RAW to adjust white balance and exposure in post",
      "Include foreground elements to enhance the sense of depth",
      "Try converting to black and white - fog images often shine in monochrome"
    ]
  },
  {
    id: "forest",
    name: "Forest Light Beams",
    subtitle: "Capturing magical woodland rays",
    description: "Discover how to photograph those stunning light rays (god rays or crepuscular rays) that filter through forest canopy, creating dramatic and mystical atmosphere in woodland settings.",
    bestTime: "Early morning with mist, 30-90 minutes after sunrise",
    weatherConditions: ["Fog", "Mist", "Partly Cloudy"],
    difficulty: "intermediate",
    imageUrl: forest,
    cameraSettings: {
      iso: "400-1600",
      aperture: "f/8 - f/16",
      shutterSpeed: "1/60 - 1/250s",
      whiteBalance: "Auto or Daylight"
    },
    mentorTips: [
      "Light beams are most visible when there's moisture or particles in the air - fog, mist, or dust",
      "You need contrast - dark forest with bright shafts of light breaking through",
      "Underexpose slightly to make the beams more dramatic and defined",
      "Dense forests with gaps in the canopy work better than sparse woods"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Choose the Right Forest",
        instruction: "Look for dense forests with tall trees and occasional gaps in the canopy where light can penetrate.",
        mentorAdvice: "Not all forests create light beams. You need tall, dense tree cover with strategic gaps. Pine forests often work better than deciduous woods because their straight trunks create stronger rays."
      },
      {
        step: 2,
        title: "Time It for Low Angle Sun",
        instruction: "Arrive when the sun is still low (15-30 degrees above horizon) so rays penetrate horizontally through the forest.",
        mentorAdvice: "When the sun is high, light comes straight down - boring. Low angle sun creates those dramatic diagonal rays we're after. Early morning is ideal because fog adds visibility to the beams."
      },
      {
        step: 3,
        title: "Underexpose by 1/2 to 1 Stop",
        instruction: "Reduce exposure to keep the forest dark and make light beams more prominent. Check histogram.",
        mentorAdvice: "Light beams disappear if your exposure is too bright. The forest should be moody and dark with bright shafts of light. Don't be afraid of shadows - they create the drama."
      },
      {
        step: 4,
        title: "Compose with Ray Direction",
        instruction: "Position yourself so rays lead into your frame diagonally or converge toward a point of interest.",
        mentorAdvice: "Light beams are natural leading lines. Use them to guide the viewer's eye through your image. Diagonal rays create more energy than vertical ones. Look for rays hitting a tree, rock, or path."
      },
      {
        step: 5,
        title: "Include Foreground Interest",
        instruction: "Add ferns, fallen logs, or forest floor elements in the foreground to create depth.",
        mentorAdvice: "Light beams alone can feel empty. I always include foreground elements to ground the image and create layers - foreground detail, middle-ground rays, background forest."
      }
    ],
    commonMistakes: [
      "Shooting when sun is too high - rays will be too vertical or nonexistent",
      "Overexposing the scene - light beams become invisible",
      "Forgetting to include context - just rays without forest structure",
      "Not waiting for the right atmospheric conditions (mist or dust)"
    ],
    proTechniques: [
      "Use spot metering on a mid-tone area to preserve beam brightness",
      "Try different apertures - f/16 creates star bursts, f/8 softer light",
      "Stack multiple exposures to capture full dynamic range",
      "Add subtle negative clarity in post to enhance the ethereal mood"
    ]
  },
  {
    id: "beach-desert",
    name: "Beach & Desert Light",
    subtitle: "Mastering harsh light and reflections",
    description: "Learn to work with bright, challenging conditions at beaches and deserts. Transform harsh midday light and strong reflections into stunning, high-contrast images with proper technique.",
    bestTime: "Early morning, late afternoon, or blue hour",
    weatherConditions: ["Clear", "Partly Cloudy"],
    difficulty: "intermediate",
    imageUrl: beachDesert,
    cameraSettings: {
      iso: "100-200",
      aperture: "f/8 - f/16",
      shutterSpeed: "1/250 - 1/1000s",
      whiteBalance: "Auto or Daylight"
    },
    mentorTips: [
      "Bright sand and water fool your camera - expect to adjust exposure compensation",
      "Golden hour is even more magical here because the light bounces off sand and water",
      "Use the natural reflections in wet sand or still water as compositional elements",
      "Protect your gear from sand and salt spray - use UV filters and keep lens caps handy"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Plan for Golden Hour",
        instruction: "Avoid midday sun - arrive at least 45 minutes before sunset or after sunrise for the best light.",
        mentorAdvice: "Midday beach photography is brutal - harsh shadows, squinting subjects, blown highlights. I shoot beaches at golden hour when the light is warm and directional. Trust me on this."
      },
      {
        step: 2,
        title: "Manage Bright Reflections",
        instruction: "Use exposure compensation +1/2 to +1 stop to prevent sand and water from appearing too dark.",
        mentorAdvice: "White sand and bright water trick your camera into underexposing. Check your histogram - the sand should be bright but not clipped. Your LCD lies in bright sunlight."
      },
      {
        step: 3,
        title: "Use Wet Sand Reflections",
        instruction: "Shoot during or after high tide when wet sand creates perfect mirror reflections of sky and subjects.",
        mentorAdvice: "Wet sand is a natural reflector - it doubles the beauty of your scene. I time my beach shoots around tides. That thin layer of water on sand is pure gold for reflections."
      },
      {
        step: 4,
        title: "Include Foreground Elements",
        instruction: "Add shells, rocks, driftwood, or footprints in the foreground to create depth and scale.",
        mentorAdvice: "Empty beach shots can feel flat. I always search for interesting foreground elements - a piece of driftwood, a pattern in the sand, shells. They give the viewer a place to start their visual journey."
      },
      {
        step: 5,
        title: "Protect and Clean Your Gear",
        instruction: "Use a UV filter, avoid changing lenses in wind, and wipe salt spray immediately.",
        mentorAdvice: "I've seen cameras destroyed by sand and salt. Keep gear in a sealed bag, use a UV filter as a sacrificial element, and clean your gear thoroughly after every beach shoot. Sand gets everywhere."
      }
    ],
    commonMistakes: [
      "Shooting at midday when light is harsh and unflattering",
      "Underexposing bright scenes - let white sand be bright",
      "Not checking for sensor spots (sand and spray create them quickly)",
      "Forgetting to scout for tide times and wind conditions"
    ],
    proTechniques: [
      "Use a polarizing filter to control water reflections and deepen sky color",
      "Try long exposures (1-4 seconds) to smooth out water movement",
      "Shoot silhouettes at sunset by exposing for the bright sky",
      "Use a graduated ND filter to balance bright sky with darker foreground"
    ]
  },
  {
    id: "night",
    name: "Night Sky Photography",
    subtitle: "Capturing stars and the Milky Way",
    description: "Master the art of photographing stars, the Milky Way, and nightscapes. Learn to work in extremely low light while capturing sharp stars and beautiful foreground details.",
    bestTime: "New moon phase, clear nights, astronomical twilight",
    weatherConditions: ["Clear", "No Moon or Crescent Moon"],
    difficulty: "advanced",
    imageUrl: night,
    cameraSettings: {
      iso: "1600-6400",
      aperture: "f/1.4 - f/2.8 (widest available)",
      shutterSpeed: "15-25 seconds (500 rule)",
      whiteBalance: "3200-4000K or Tungsten"
    },
    mentorTips: [
      "The 500 rule: divide 500 by your focal length to get max shutter speed before stars trail (e.g., 500/20mm = 25 seconds)",
      "Find truly dark skies - use light pollution maps to locate the darkest areas within driving distance",
      "Focus manually on a bright star using live view at 10x magnification",
      "Bring layers and warm clothes - night shoots are long and cold"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Scout Location During Daylight",
        instruction: "Visit your shooting location during the day to find interesting foreground elements and compositions.",
        mentorAdvice: "Never scout at night for the first time - you'll fumble around wasting precious dark time. I visit during the day, mark my spot with GPS, and plan my composition before sunset arrives."
      },
      {
        step: 2,
        title: "Set Up Before Dark",
        instruction: "Arrive an hour before astronomical twilight ends. Set up tripod, camera, and focus while you can still see.",
        mentorAdvice: "Working in total darkness is challenging. I set everything up during twilight - compose my shot, preset my focus on infinity, mark my focus ring with tape. Then I'm ready when stars pop out."
      },
      {
        step: 3,
        title: "Nail Your Focus on Stars",
        instruction: "Switch to manual focus. Use live view at 10x zoom on a bright star. Adjust focus until the star is a tiny point.",
        mentorAdvice: "This is the hardest part for beginners. Find the brightest star you can see. Zoom in on live view as far as possible. Tweak focus until that star is the smallest, sharpest point. Take a test shot to verify."
      },
      {
        step: 4,
        title: "Calculate Exposure with 500 Rule",
        instruction: "Divide 500 by your focal length (full-frame equivalent) to find maximum shutter speed before trailing.",
        mentorAdvice: "For a 20mm lens: 500÷20 = 25 seconds max. Go longer and stars trail. Start with ISO 3200, f/2.8, 20 seconds. Check histogram - pull right without clipping. Increase ISO if needed."
      },
      {
        step: 5,
        title: "Compose with Interesting Foreground",
        instruction: "Include silhouettes of trees, mountains, or structures to anchor your Milky Way image.",
        mentorAdvice: "Stars alone aren't enough - you need foreground context. I silhouette a dead tree, mountain ridge, or cabin against the Milky Way. Paint foreground with gentle light from headlamp if needed."
      }
    ],
    commonMistakes: [
      "Shooting on nights with too much moonlight - wait for new moon",
      "Using too long exposure and getting star trails instead of points",
      "Forgetting spare batteries - cold kills battery life fast",
      "Not checking for dew on lens every 15-20 minutes"
    ],
    proTechniques: [
      "Shoot multiple images and stack them to reduce noise",
      "Use an intervalometer for star trails (100+ images at 30 seconds each)",
      "Try focus stacking: one image focused on foreground, one on stars",
      "Shoot a panorama of the Milky Way by taking 3-5 overlapping frames"
    ]
  },
  {
    id: "rain",
    name: "Rain Photography",
    subtitle: "Transforming wet weather into art",
    description: "Don't let rain stop you from creating amazing images. Learn to embrace wet conditions to capture unique reflections, textures, and moods that only exist during and after rainfall.",
    bestTime: "During rain, immediately after, or before storm arrives",
    weatherConditions: ["Rain", "Drizzle", "Just After Rain"],
    difficulty: "beginner",
    imageUrl: rain,
    cameraSettings: {
      iso: "400-1600",
      aperture: "f/4 - f/8",
      shutterSpeed: "1/125 - 1/500s",
      whiteBalance: "Cloudy or Auto"
    },
    mentorTips: [
      "Protect your camera with a rain sleeve, shower cap, or plastic bag with lens hole",
      "Overcast rain provides beautifully soft, even light - no harsh shadows",
      "Look down - puddles become mirrors reflecting the world above",
      "The moments just before and after rain often provide the most dramatic light"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Protect Your Gear",
        instruction: "Use a rain cover, plastic bag, or even a shower cap to protect your camera body. Keep lens cloth handy.",
        mentorAdvice: "I've shot in downpours with just a grocery bag and rubber band. Cut a hole for the lens, secure with a rubber band around the lens hood. Change your cloth every 10 minutes - wet cloth smears."
      },
      {
        step: 2,
        title: "Hunt for Puddle Reflections",
        instruction: "Look for puddles that reflect interesting subjects - neon signs, buildings, people, colorful umbrellas.",
        mentorAdvice: "Get low - really low. I crouch or even lie down to shoot puddles. The reflection is your main subject, not the puddle itself. Include just a sliver of the real scene at the top for context."
      },
      {
        step: 3,
        title: "Capture Rain Drops and Patterns",
        instruction: "Shoot rain drops on windows, leaves, spider webs, or ripples forming in puddles.",
        mentorAdvice: "Macro moments are everywhere in rain. I love shooting through rain-covered windows - the world becomes an impressionist painting. Drops on spider webs with backlight create magic. Look for these details."
      },
      {
        step: 4,
        title: "Use Overcast Light to Your Advantage",
        instruction: "The soft, diffused light from overcast skies eliminates harsh shadows - perfect for portraits and street photography.",
        mentorAdvice: "Overcast is like nature's softbox - free, beautiful, even light. Colors appear saturated because there are no hard shadows to create contrast. This is perfect light for capturing people and details."
      },
      {
        step: 5,
        title: "Shoot Just After Rain Stops",
        instruction: "The moments after rain often provide dramatic light as sun breaks through clouds, creating intense colors and contrast.",
        mentorAdvice: "Don't pack up when rain stops - that's when magic happens. Sun breaking through wet atmosphere creates incredible light. Everything is wet and reflective. Rainbows appear. This is the golden moment."
      }
    ],
    commonMistakes: [
      "Staying inside - some of the best photos happen in bad weather",
      "Not protecting gear properly - one raindrop on lens ruins shots",
      "Missing the dramatic light that happens right after storms",
      "Shooting raindrops too fast - slow shutter creates streaks"
    ],
    proTechniques: [
      "Use fast shutter (1/1000s+) to freeze individual raindrops in mid-air",
      "Try slow shutter (1/30s) to create rain streaks for motion effect",
      "Backlight rain with flash or sunlight to make drops glow",
      "Convert rain images to black and white for dramatic, moody results"
    ]
  },
  {
    id: "silhouette",
    name: "Silhouette Photography",
    subtitle: "Creating dramatic shapes against light",
    description: "Master the art of silhouette photography by positioning subjects between your camera and a strong light source. Create powerful, minimalist images that focus on shape and form.",
    bestTime: "Sunrise, sunset, or against bright windows",
    weatherConditions: ["Clear", "Partly Cloudy"],
    difficulty: "beginner",
    imageUrl: silhouette,
    cameraSettings: {
      iso: "100-400",
      aperture: "f/8 - f/16",
      shutterSpeed: "1/250 - 1/1000s",
      whiteBalance: "Auto or Daylight"
    },
    mentorTips: [
      "Expose for the bright background, not the subject - meter on the sky",
      "Choose subjects with distinctive, recognizable shapes - profiles work better than front views",
      "Clean backgrounds create stronger silhouettes - avoid cluttered horizons",
      "Shoot during golden hour for colorful backgrounds that make silhouettes pop"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Position Subject Between You and Light",
        instruction: "Place your subject directly between your camera and the brightest part of the scene (sun, window, etc.).",
        mentorAdvice: "The setup is simple but critical - subject blocks light source. The stronger the backlight, the darker and more dramatic your silhouette. Sunset and sunrise are perfect because the sky provides color."
      },
      {
        step: 2,
        title: "Meter on the Bright Background",
        instruction: "Use spot metering on the bright sky or switch to manual and expose so the background looks correct.",
        mentorAdvice: "Your camera wants to expose for your dark subject - don't let it. I use spot metering directly on the bright sky, or manual mode exposing so the sky looks good. Subject goes dark automatically."
      },
      {
        step: 3,
        title: "Choose Distinctive Subject Shapes",
        instruction: "Select subjects with clear, recognizable profiles - people in profile, trees, birds, architecture.",
        mentorAdvice: "Details disappear in silhouettes, so shape is everything. A person's profile tells more story than their front. A lone tree creates more impact than a forest. Think about the shape's silhouette alone."
      },
      {
        step: 4,
        title: "Separate Subject from Background",
        instruction: "Create space between subject and horizon. Position subject against clear sky, not overlapping with other elements.",
        mentorAdvice: "A silhouette merging with the horizon loses impact. I make sure there's clear sky around my subject's outline. Get low to show subject against sky, or find elevated backgrounds like hilltops."
      },
      {
        step: 5,
        title: "Shoot Multiple Compositions",
        instruction: "Try different subject positions, poses, and compositions. Silhouettes are forgiving - experiment freely.",
        mentorAdvice: "The beauty of silhouettes is you can direct subjects without worrying about facial expressions or lighting ratios. Have people jump, dance, hold hands. Try different angles. Take lots of shots."
      }
    ],
    commonMistakes: [
      "Exposing for the subject instead of the background",
      "Choosing cluttered backgrounds that confuse the silhouette",
      "Shooting front views when profiles would be more recognizable",
      "Not creating separation between subject and horizon"
    ],
    proTechniques: [
      "Include the sun partially in frame for dramatic lens flare and light bursts",
      "Try group silhouettes with people at different distances for depth",
      "Shoot silhouettes in water reflections for abstract symmetry",
      "Use negative space creatively - let the colorful sky dominate the frame"
    ]
  },
  {
    id: "sky-clouds",
    name: "Dramatic Cloud Photography",
    subtitle: "Capturing nature's canvas",
    description: "Learn to photograph stunning cloud formations, from peaceful fluffy cumulus to dramatic storm clouds. Understand how to expose for skies while maintaining foreground detail.",
    bestTime: "Late afternoon, sunset, or before/after storms",
    weatherConditions: ["Partly Cloudy", "Cloudy", "Stormy"],
    difficulty: "intermediate",
    imageUrl: skyClouds,
    cameraSettings: {
      iso: "100-400",
      aperture: "f/8 - f/11",
      shutterSpeed: "1/125 - 1/500s",
      whiteBalance: "Daylight or Cloudy"
    },
    mentorTips: [
      "The most dramatic clouds happen before and after storms - not during",
      "Use a polarizing filter to deepen blue skies and increase cloud contrast",
      "Include foreground elements to give scale and context to dramatic skies",
      "Underexpose slightly to preserve cloud detail and increase drama"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Monitor Weather for Cloud Opportunities",
        instruction: "Watch weather forecasts for partly cloudy or clearing storm conditions. These create the most dramatic skies.",
        mentorAdvice: "I obsess over weather apps. The best clouds happen when weather is unstable - clearing storms, approaching fronts, or broken clouds at sunset. Partly cloudy beats clear or completely overcast every time."
      },
      {
        step: 2,
        title: "Use Polarizing Filter",
        instruction: "Attach a circular polarizing filter and rotate it while looking through viewfinder until sky deepens and clouds pop.",
        mentorAdvice: "A polarizer is my secret weapon for clouds. Rotate it until the sky goes from pale blue to deep, rich blue. Clouds become bright white against dark sky. Maximum effect is 90 degrees from the sun."
      },
      {
        step: 3,
        title: "Expose for Cloud Detail",
        instruction: "Check your histogram. Cloud highlights should touch the right edge but not clip. Underexpose by -1/2 stop if needed.",
        mentorAdvice: "Blown-out white clouds have no detail or drama. I expose so cloud highlights are bright but not clipped on the histogram. Underexposing slightly adds mood and makes clouds more three-dimensional."
      },
      {
        step: 4,
        title: "Include Strong Foreground",
        instruction: "Add trees, buildings, mountains, or other elements in the foreground to provide scale and anchor the dramatic sky.",
        mentorAdvice: "Sky alone can feel empty. I follow the rule: if sky is dramatic, include 2/3 sky and 1/3 foreground. The foreground grounds the image and shows scale of those massive clouds."
      },
      {
        step: 5,
        title: "Shoot at Different Times",
        instruction: "Return to the same location at different times - clouds transform with changing light throughout the day.",
        mentorAdvice: "Same clouds, different light = completely different mood. Morning light creates warm clouds. Midday gives white clouds and blue sky. Sunset turns clouds into fire. I shoot clouds at all times."
      }
    ],
    commonMistakes: [
      "Blowing out cloud highlights - losing all detail in white areas",
      "Shooting at midday when clouds are flat and lack dimension",
      "Not using a polarizing filter to maximize cloud drama",
      "Forgetting to include foreground for scale and context"
    ],
    proTechniques: [
      "Bracket exposures (+/-2 stops) and blend in post for full dynamic range",
      "Use graduated ND filter to darken sky while keeping foreground visible",
      "Try black and white conversion for ultra-dramatic cloud images",
      "Shoot HDR (3-5 bracketed images) for extreme dynamic range scenes"
    ]
  },
  {
    id: "urban",
    name: "Urban Photography",
    subtitle: "Finding beauty in the city",
    description: "Discover the art of capturing cityscapes, street scenes, architecture, and urban geometry. Learn to find compelling compositions in the chaos of city environments.",
    bestTime: "Blue hour, night, or early morning",
    weatherConditions: ["Any", "Rain for reflections"],
    difficulty: "intermediate",
    imageUrl: urban,
    cameraSettings: {
      iso: "400-3200",
      aperture: "f/8 - f/11",
      shutterSpeed: "1/60 - 1/250s (handheld) or 1-30s (tripod)",
      whiteBalance: "Auto or Tungsten (for warm city lights)"
    },
    mentorTips: [
      "Blue hour is magical in cities - the sky balances with city lights perfectly",
      "Look for patterns, leading lines, and symmetry in architecture",
      "Include people for scale and life - cities are about human activity",
      "Rainy nights create amazing reflections on wet streets"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Scout During the Day",
        instruction: "Walk around during daylight to find interesting angles, reflective surfaces, and vantage points.",
        mentorAdvice: "I never shoot a city location at night without visiting during the day first. I scout building angles, find reflection puddles, mark where light hits, and plan my compositions. This saves time at night."
      },
      {
        step: 2,
        title: "Shoot During Blue Hour",
        instruction: "Arrive 30 minutes before sunset. The best moment is when sky and city lights balance - usually 20 minutes after sunset.",
        mentorAdvice: "Blue hour in cities is pure magic. The blue sky provides a colored backdrop, and city lights are bright enough to register but not overpower. This balance lasts only 20-30 minutes - work fast."
      },
      {
        step: 3,
        title: "Use Leading Lines and Geometry",
        instruction: "Look for roads, sidewalks, building lines, and architectural elements that guide the eye through your composition.",
        mentorAdvice: "Cities are full of natural leading lines - streets converge, buildings line up, bridges lead somewhere. I use these to create depth. Diagonal lines add energy. Symmetry creates calm. Choose intentionally."
      },
      {
        step: 4,
        title: "Embrace Light Trails",
        instruction: "Use 2-8 second exposures to turn moving car lights into colorful streaks. Tripod required.",
        mentorAdvice: "Light trails scream 'city at night.' I set up on an overpass or sidewalk, use 4-6 second exposures, and let traffic paint light streaks through my frame. Wait for multiple cars for fuller trails."
      },
      {
        step: 5,
        title: "Include Human Element",
        instruction: "Capture people, movement, and life in the city. Use slower shutters to blur motion, creating energy and flow.",
        mentorAdvice: "Empty cities feel dead. I include people - blurred crowds, a lone figure, silhouettes. Slower shutter (1/15s-1/30s) blurs moving people while keeping buildings sharp. This shows the city's energy."
      }
    ],
    commonMistakes: [
      "Shooting too early - waiting for full darkness loses sky detail",
      "Not bringing a tripod for long exposures and light trails",
      "Ignoring the human element - cities are about people",
      "Missing the brief blue hour window when sky and lights balance"
    ],
    proTechniques: [
      "Shoot from elevated positions (parking garages, rooftops) for cityscape views",
      "Use tilt-shift lens or post-processing for miniature effect",
      "Try intentional camera movement during exposure for abstract cityscapes",
      "Shoot reflections in modern glass buildings for surreal urban abstracts"
    ]
  },
  {
    id: "water",
    name: "Water Photography",
    subtitle: "Freezing or smoothing motion",
    description: "Master the techniques to either freeze water motion sharply or transform it into silky smooth flows. Learn to work with waterfalls, rivers, ocean waves, and flowing streams.",
    bestTime: "Early morning, overcast days, or use ND filters",
    weatherConditions: ["Cloudy", "Shade", "Any with ND filter"],
    difficulty: "intermediate",
    imageUrl: water,
    cameraSettings: {
      iso: "100-200",
      aperture: "f/11 - f/22 (smooth) or f/5.6 (frozen)",
      shutterSpeed: "1-4 seconds (smooth) or 1/500s+ (frozen)",
      whiteBalance: "Daylight or Auto"
    },
    mentorTips: [
      "For silky water, you need slow shutter speeds - 1 to 4 seconds is ideal",
      "Use ND filters in bright conditions to achieve long exposures without overexposing",
      "Frozen water requires fast shutter speeds - 1/500s or faster",
      "Include rocks, logs, or other stationary elements to contrast with the water's motion"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Choose Your Water Effect",
        instruction: "Decide if you want smooth, silky water (long exposure) or frozen, sharp water (fast shutter). This determines your approach.",
        mentorAdvice: "There's no right choice - just different moods. Silky water feels calm, dreamy, ethereal. Frozen water shows power, energy, impact. I choose based on the scene and story I want to tell."
      },
      {
        step: 2,
        title: "Set Up Tripod Solidly",
        instruction: "For smooth water, tripod stability is critical. Place legs firmly, hang your bag from center for weight, use remote or timer.",
        mentorAdvice: "Any movement during long exposure ruins the shot. I test my tripod by gently pushing - if it wobbles, it's not solid. Hang your camera bag from the center hook. Use 2-second timer or remote. No touching camera."
      },
      {
        step: 3,
        title: "Attach ND Filter for Smooth Effect",
        instruction: "In bright light, use 3-6 stop ND filter to slow shutter to 1-4 seconds while maintaining proper exposure.",
        mentorAdvice: "Without ND filter, you'll overexpose trying to slow the shutter. I carry a 6-stop ND for waterfalls. Screw it on, then adjust shutter until exposure is correct. Start at 2 seconds and adjust from there."
      },
      {
        step: 4,
        title: "Compose with Stationary Elements",
        instruction: "Include sharp rocks, logs, or vegetation to contrast with the smooth water. This creates visual interest and shows the motion.",
        mentorAdvice: "All smooth water is boring - you need sharp elements for contrast. A sharp rock in silky water tells the viewer 'this water is moving.' I look for interesting foreground rocks or logs to anchor the composition."
      },
      {
        step: 5,
        title: "Experiment with Shutter Speeds",
        instruction: "Try different shutter speeds to control water appearance: 1/2s for texture, 1-2s for smooth, 4s+ for glass-like.",
        mentorAdvice: "Don't just shoot one shutter speed. I bracket my water shots: 1/2s shows some texture, 2s is smooth, 8s is completely silky. Each creates different mood. Shoot all and choose in post."
      }
    ],
    commonMistakes: [
      "Not using tripod or having unstable tripod setup",
      "Forgetting ND filter on bright days - can't slow shutter enough",
      "Using too slow shutter - water becomes featureless white blob",
      "Not including sharp elements to show contrast with moving water"
    ],
    proTechniques: [
      "Use variable ND filter to fine-tune exposure without changing filters",
      "Try 'frozen edges, smooth center' by using medium shutter (1/15s-1/30s)",
      "Shoot waves with fast shutter (1/1000s+) to freeze individual water droplets",
      "Include autumn leaves or petals floating on water for color and interest"
    ]
  },
  {
    id: "old-architecture",
    name: "Old Architecture Photography",
    subtitle: "Capturing history and character",
    description: "Learn to photograph historic buildings, ruins, and old structures with an eye for texture, decay, and storytelling. Bring out the character and history in weathered architecture.",
    bestTime: "Golden hour, blue hour, or soft overcast light",
    weatherConditions: ["Partly Cloudy", "Overcast"],
    difficulty: "intermediate",
    imageUrl: oldArchitecture,
    cameraSettings: {
      iso: "100-400",
      aperture: "f/8 - f/16",
      shutterSpeed: "1/60 - 1/250s",
      whiteBalance: "Daylight or Cloudy"
    },
    mentorTips: [
      "Look for texture and decay - peeling paint, weathered wood, aged stone tell stories",
      "Soft, angled light reveals texture better than harsh midday sun",
      "Include architectural details that show age and craftsmanship",
      "Consider black and white conversion to emphasize texture and form over color"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Scout for Character Details",
        instruction: "Walk around the building to find interesting angles, textures, doorways, windows, and weathered surfaces.",
        mentorAdvice: "Don't just shoot the obvious front view. I circle old buildings looking for character - a worn doorway, crumbling stone, beautiful decay. These details tell the building's story better than wide shots."
      },
      {
        step: 2,
        title: "Shoot in Soft Directional Light",
        instruction: "Golden hour or overcast days provide soft light that reveals texture without harsh shadows.",
        mentorAdvice: "Harsh midday sun creates black shadows that hide architectural details. I shoot old buildings in soft morning light or on overcast days. Side light at golden hour reveals every crack and texture beautifully."
      },
      {
        step: 3,
        title: "Emphasize Texture and Decay",
        instruction: "Get close to weathered surfaces. Peeling paint, rusted metal, aged wood all tell the building's history.",
        mentorAdvice: "Texture is the soul of old architecture. I fill my frame with weathered details - cracked paint, rusted hinges, worn stone. Use small aperture (f/11-f/16) for front-to-back sharpness on textured surfaces."
      },
      {
        step: 4,
        title: "Include Context and Scale",
        instruction: "Show the building's environment and add people or objects for scale. This helps tell the complete story.",
        mentorAdvice: "A detail shot is beautiful, but also capture the full building in its environment. I include surrounding landscape, overgrown vegetation, or a person for scale. This gives context to all those detail shots."
      },
      {
        step: 5,
        title: "Consider Black and White",
        instruction: "Historic architecture often shines in monochrome, which emphasizes form, texture, and drama over distracting colors.",
        mentorAdvice: "I shoot old buildings in RAW and always consider B&W conversion. Removing color forces viewers to see texture, light, and form. Use high contrast and clarity to emphasize aged character."
      }
    ],
    commonMistakes: [
      "Shooting at midday when harsh light hides architectural details",
      "Only taking wide establishing shots and missing character details",
      "Not correcting vertical lines - tilted buildings look unprofessional",
      "Including modern distracting elements (cars, signs, power lines) in frame"
    ],
    proTechniques: [
      "Use tilt-shift lens or correct in post to fix converging vertical lines",
      "Bracket exposures for HDR to capture full detail in bright windows and dark interiors",
      "Shoot from low angles to emphasize height and grandeur",
      "Include weathered objects (old doors, windows, furniture) as foreground elements"
    ]
  },
  {
    id: "indoor-golden",
    name: "Indoor Golden Light",
    subtitle: "Working with window light",
    description: "Master the art of using natural window light indoors to create warm, soft, cinematic portraits and still life images with a golden quality.",
    bestTime: "Morning or afternoon when sun streams through windows",
    weatherConditions: ["Clear", "Partly Cloudy"],
    difficulty: "beginner",
    imageUrl: urban, // Using urban as placeholder since indoor-golden.jpg exists
    cameraSettings: {
      iso: "400-1600",
      aperture: "f/1.8 - f/4",
      shutterSpeed: "1/60 - 1/250s",
      whiteBalance: "Auto or Daylight"
    },
    mentorTips: [
      "Window light is like a natural softbox - position subject perpendicular to window",
      "Sheer curtains diffuse harsh sunlight beautifully",
      "Use a reflector opposite the window to fill shadows",
      "The closer to the window, the softer the light becomes"
    ],
    stepByStep: [
      {
        step: 1,
        title: "Find the Right Window",
        instruction: "Look for windows with indirect sunlight or use sheer curtains to diffuse direct sun. North-facing windows provide consistent soft light.",
        mentorAdvice: "Direct harsh sun through a window is still harsh. I look for windows where light bounces in softly, or I hang a white sheet to diffuse it. Large windows create broader, softer light than small windows."
      },
      {
        step: 2,
        title: "Position Subject at 45-90 Degrees",
        instruction: "Place your subject facing slightly toward the window, not directly into it. This creates dimension and depth.",
        mentorAdvice: "Position is everything with window light. I place subjects at 45 degrees to the window - one side lit, one side in gentle shadow. This creates that cinematic, dimensional look. Dead-on lighting is flat."
      },
      {
        step: 3,
        title: "Use Wide Aperture for Soft Background",
        instruction: "Shoot at f/1.8-f/2.8 to create beautiful background blur (bokeh) while keeping your subject sharp.",
        mentorAdvice: "Wide aperture is your friend indoors. I shoot at f/2.8 or wider to blur distracting backgrounds and create that professional look with subject separated from environment. Focus on the eyes always."
      },
      {
        step: 4,
        title: "Add Fill Light with Reflector",
        instruction: "Place a white reflector (foam board, white sheet, or actual reflector) opposite the window to bounce light into shadows.",
        mentorAdvice: "One window = one light = deep shadows on the other side. I bounce light back with anything white - foam board, white sheet, even a white wall. This fills shadows without killing the mood."
      },
      {
        step: 5,
        title: "Adjust ISO as Needed",
        instruction: "Don't be afraid to increase ISO to 800-1600 to maintain proper shutter speed. Modern cameras handle noise well.",
        mentorAdvice: "Blurry shots are worse than a little noise. I'd rather shoot ISO 1600 and get a sharp image than ISO 400 with motion blur. Your shutter speed should be 1/125s minimum for portraits to freeze movement."
      }
    ],
    commonMistakes: [
      "Using direct harsh sunlight without diffusion",
      "Positioning subject facing directly into window (flat lighting)",
      "Setting ISO too low and getting motion blur from slow shutter",
      "Not filling shadows - resulting in overly contrasty images"
    ],
    proTechniques: [
      "Create rim light by backlighting subject from window behind them",
      "Use colored fabrics on windows to create mood lighting",
      "Try 'Rembrandt lighting' by positioning subject so window creates triangle of light on cheek",
      "Shoot in RAW to adjust white balance and recover shadow detail in post"
    ]
  }
];
