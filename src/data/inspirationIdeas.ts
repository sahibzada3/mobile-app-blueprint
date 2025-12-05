import natureLeafImg from "@/assets/ideas/nature-leaf.jpg";
import everydayCoffeeImg from "@/assets/ideas/everyday-coffee.jpg";
import lightSilhouetteImg from "@/assets/ideas/light-silhouette.jpg";
import feelingsCalmImg from "@/assets/ideas/feelings-calm.jpg";
import writeSkyImg from "@/assets/ideas/write-sky.jpg";

export interface InspirationIdea {
  id: string;
  title: string;
  description: string;
  sampleCaption?: string;
  mood: string;
}

export interface InspirationCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  image: string;
  ideas: InspirationIdea[];
}

export const inspirationCategories: InspirationCategory[] = [
  {
    id: "nature-stories",
    title: "Nature Stories",
    subtitle: "Express peace, hope & emotions through nature",
    icon: "Leaf",
    gradient: "from-emerald-500/20 to-cyan-500/20",
    image: natureLeafImg,
    ideas: [
      {
        id: "n1",
        title: "A Single Leaf Falling",
        description: "Capture the gentle descent of a leaf. It speaks of letting go, change, and finding beauty in endings.",
        sampleCaption: "Some things fall apart so better things can fall into place.",
        mood: "peaceful"
      },
      {
        id: "n2",
        title: "Morning Light Through Trees",
        description: "The first rays filtering through branches. A reminder that light always finds a way.",
        sampleCaption: "Even the darkest forest welcomes the dawn.",
        mood: "hopeful"
      },
      {
        id: "n3",
        title: "Raindrops on Petals",
        description: "Fragile beauty holding the weight of rain. Resilience in its purest form.",
        sampleCaption: "Softness is not weakness — it's how flowers survive the storm.",
        mood: "gentle"
      },
      {
        id: "n4",
        title: "A Winding Mountain Path",
        description: "The journey matters more than the peak. Capture paths that invite curiosity.",
        sampleCaption: "Not all who wander are lost — some are just beginning.",
        mood: "adventurous"
      },
      {
        id: "n5",
        title: "Still Water Reflection",
        description: "When water mirrors the sky. Stillness reveals what motion hides.",
        sampleCaption: "Be still enough to see your own reflection.",
        mood: "calm"
      },
      {
        id: "n6",
        title: "Wildflowers in Forgotten Places",
        description: "Beauty grows where nobody planted it. Find the untamed, the overlooked.",
        sampleCaption: "Bloom where no one expected you to.",
        mood: "inspiring"
      }
    ]
  },
  {
    id: "everyday-moments",
    title: "Everyday Moments",
    subtitle: "Find stories in ordinary objects",
    icon: "Coffee",
    gradient: "from-amber-500/20 to-orange-500/20",
    image: everydayCoffeeImg,
    ideas: [
      {
        id: "e1",
        title: "A Half-Read Book",
        description: "Pages waiting to be turned. Stories paused mid-thought. Someone's world left open.",
        sampleCaption: "Every bookmark is a promise to return.",
        mood: "thoughtful"
      },
      {
        id: "e2",
        title: "Steam Rising from a Cup",
        description: "Warmth escaping into cold air. Comfort made visible. A quiet ritual.",
        sampleCaption: "Some moments are meant to be held, not rushed.",
        mood: "cozy"
      },
      {
        id: "e3",
        title: "Empty Chair by a Window",
        description: "Someone was here. Someone will return. The space between holds a story.",
        sampleCaption: "Presence is felt even in absence.",
        mood: "nostalgic"
      },
      {
        id: "e4",
        title: "Keys Left on a Table",
        description: "The promise of coming home. Small objects, big meanings.",
        sampleCaption: "Home is not a place — it's a feeling waiting for you.",
        mood: "warm"
      },
      {
        id: "e5",
        title: "Worn-Out Shoes",
        description: "Miles walked. Paths taken. Every scuff tells a story.",
        sampleCaption: "The journey writes itself on the things we carry.",
        mood: "reflective"
      },
      {
        id: "e6",
        title: "Handwritten Notes",
        description: "Words in someone's handwriting. Personal. Imperfect. Real.",
        sampleCaption: "In a digital world, handwriting is a love letter to time.",
        mood: "intimate"
      }
    ]
  },
  {
    id: "light-shadows",
    title: "Light & Shadows",
    subtitle: "Create emotional moods with contrast",
    icon: "Sun",
    gradient: "from-violet-500/20 to-purple-500/20",
    image: lightSilhouetteImg,
    ideas: [
      {
        id: "l1",
        title: "Window Shadows on Walls",
        description: "Light painting patterns only time can create. Geometry of the passing day.",
        sampleCaption: "The sun writes poetry on empty walls.",
        mood: "artistic"
      },
      {
        id: "l2",
        title: "Silhouette at Golden Hour",
        description: "When light outlines what darkness reveals. Mystery meets warmth.",
        sampleCaption: "Some stories are better told in silhouette.",
        mood: "dramatic"
      },
      {
        id: "l3",
        title: "Reflection in Puddles",
        description: "Another world beneath your feet. Reality mirrored, slightly distorted.",
        sampleCaption: "Look down to see the sky differently.",
        mood: "dreamy"
      },
      {
        id: "l4",
        title: "Light Through Curtains",
        description: "Soft light filtering through fabric. The boundary between inside and outside.",
        sampleCaption: "There's poetry in the way light asks permission to enter.",
        mood: "gentle"
      },
      {
        id: "l5",
        title: "Long Shadows at Sunset",
        description: "When everything stretches toward the horizon. Time made visible.",
        sampleCaption: "Shadows grow longest just before the light changes.",
        mood: "contemplative"
      },
      {
        id: "l6",
        title: "Candlelight Glow",
        description: "Warm light in darkness. Intimacy. Focus. A world reduced to what matters.",
        sampleCaption: "One small light can hold back all the dark.",
        mood: "intimate"
      }
    ]
  },
  {
    id: "feelings-through-photos",
    title: "Feelings Through Photos",
    subtitle: "Visual prompts for emotions",
    icon: "Heart",
    gradient: "from-pink-500/20 to-rose-500/20",
    image: feelingsCalmImg,
    ideas: [
      {
        id: "f1",
        title: "Calmness",
        description: "Find still waters, soft horizons, or empty spaces. Let the image breathe.",
        sampleCaption: "Peace isn't the absence of chaos — it's learning to breathe through it.",
        mood: "serene"
      },
      {
        id: "f2",
        title: "Growth",
        description: "New shoots, rising sun, open roads. Capture the feeling of becoming.",
        sampleCaption: "Growth happens in the spaces between who you were and who you're becoming.",
        mood: "hopeful"
      },
      {
        id: "f3",
        title: "Mystery",
        description: "Fog, doorways, paths that disappear. Show what hides as much as what's visible.",
        sampleCaption: "The most beautiful stories are the ones left half-told.",
        mood: "enigmatic"
      },
      {
        id: "f4",
        title: "Dreams",
        description: "Soft focus, cloud formations, starlit skies. Make reality feel like imagination.",
        sampleCaption: "Dreams don't have edges — they spill into everything.",
        mood: "ethereal"
      },
      {
        id: "f5",
        title: "Ambition",
        description: "Mountain peaks, endless roads, light breaking through. The pull toward something greater.",
        sampleCaption: "The horizon is just the beginning of what you can reach.",
        mood: "determined"
      },
      {
        id: "f6",
        title: "Nostalgia",
        description: "Old photographs, autumn colors, familiar places. Time captured, not lost.",
        sampleCaption: "Memory turns ordinary days into treasure.",
        mood: "wistful"
      }
    ]
  },
  {
    id: "write-on-photo",
    title: "Write on Your Photo",
    subtitle: "Pair images with words that resonate",
    icon: "PenTool",
    gradient: "from-cyan-500/20 to-blue-500/20",
    image: writeSkyImg,
    ideas: [
      {
        id: "w1",
        title: "Sky + Possibility",
        description: "Wide open sky shots paired with words about potential and freedom.",
        sampleCaption: "Above you is endless. So is your potential.",
        mood: "expansive"
      },
      {
        id: "w2",
        title: "Roads + Journey",
        description: "Paths, streets, trails — add words about direction and purpose.",
        sampleCaption: "Every step forward is a story being written.",
        mood: "purposeful"
      },
      {
        id: "w3",
        title: "Flowers + Resilience",
        description: "Blooms in unexpected places deserve words about strength.",
        sampleCaption: "You were never made for easy soil.",
        mood: "strong"
      },
      {
        id: "w4",
        title: "Rain + Renewal",
        description: "Raindrops, wet streets, storms clearing — words about fresh starts.",
        sampleCaption: "Let the rain remind you: endings wash into beginnings.",
        mood: "refreshing"
      },
      {
        id: "w5",
        title: "Night + Reflection",
        description: "Dark scenes, city lights, stars — pair with introspective thoughts.",
        sampleCaption: "The quiet hours know your truest thoughts.",
        mood: "introspective"
      },
      {
        id: "w6",
        title: "Hands + Connection",
        description: "Close-ups of hands working, holding, creating — words about craft and care.",
        sampleCaption: "What you build with your hands becomes part of who you are.",
        mood: "grounded"
      }
    ]
  }
];
