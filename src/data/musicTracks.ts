export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  mood: string;
  duration: string;
}

export const musicTracks: MusicTrack[] = [
  { id: "serene-dawn", name: "Serene Dawn", artist: "Nature Sounds", mood: "Calm", duration: "3:24" },
  { id: "forest-whisper", name: "Forest Whisper", artist: "Ambient Dreams", mood: "Peaceful", duration: "4:12" },
  { id: "mountain-breeze", name: "Mountain Breeze", artist: "Earth Tones", mood: "Uplifting", duration: "3:45" },
  { id: "ocean-waves", name: "Ocean Waves", artist: "Coastal Vibes", mood: "Relaxing", duration: "5:03" },
  { id: "sunset-glow", name: "Sunset Glow", artist: "Golden Hour", mood: "Warm", duration: "3:58" },
  { id: "rain-drops", name: "Rain Drops", artist: "Weather Sounds", mood: "Meditative", duration: "4:30" },
  { id: "meadow-dance", name: "Meadow Dance", artist: "Spring Collection", mood: "Joyful", duration: "3:15" },
  { id: "night-sky", name: "Night Sky", artist: "Starlight Series", mood: "Dreamy", duration: "4:45" },
  { id: "river-flow", name: "River Flow", artist: "Water Elements", mood: "Flowing", duration: "3:52" },
  { id: "autumn-leaves", name: "Autumn Leaves", artist: "Seasonal Sounds", mood: "Nostalgic", duration: "4:18" },
];

export const getMoodColor = (mood: string): string => {
  const moodColors: Record<string, string> = {
    Calm: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Peaceful: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Uplifting: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Relaxing: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    Warm: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    Meditative: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Joyful: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    Dreamy: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    Flowing: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    Nostalgic: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  };
  return moodColors[mood] || "bg-gray-100 text-gray-700";
};
