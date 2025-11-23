export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  mood: string;
  duration: string;
  audioUrl?: string;
}

export const musicTracks: MusicTrack[] = [
  { id: "serene-dawn", name: "Serene Dawn", artist: "Nature Sounds", mood: "Calm", duration: "3:24", audioUrl: "https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8c7f3f3.mp3" },
  { id: "forest-whisper", name: "Forest Whisper", artist: "Ambient Dreams", mood: "Peaceful", duration: "4:12", audioUrl: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { id: "mountain-breeze", name: "Mountain Breeze", artist: "Earth Tones", mood: "Uplifting", duration: "3:45", audioUrl: "https://cdn.pixabay.com/audio/2022/03/10/audio_d1718ab41b.mp3" },
  { id: "ocean-waves", name: "Ocean Waves", artist: "Coastal Vibes", mood: "Relaxing", duration: "5:03", audioUrl: "https://cdn.pixabay.com/audio/2022/06/07/audio_14f0868c8c.mp3" },
  { id: "sunset-glow", name: "Sunset Glow", artist: "Golden Hour", mood: "Warm", duration: "3:58", audioUrl: "https://cdn.pixabay.com/audio/2022/03/24/audio_c8ec090bd6.mp3" },
  { id: "rain-drops", name: "Rain Drops", artist: "Weather Sounds", mood: "Meditative", duration: "4:30", audioUrl: "https://cdn.pixabay.com/audio/2022/01/18/audio_d3a80c0f3f.mp3" },
  { id: "meadow-dance", name: "Meadow Dance", artist: "Spring Collection", mood: "Joyful", duration: "3:15", audioUrl: "https://cdn.pixabay.com/audio/2022/03/15/audio_25c826e44b.mp3" },
  { id: "night-sky", name: "Night Sky", artist: "Starlight Series", mood: "Dreamy", duration: "4:45", audioUrl: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3" },
  { id: "river-flow", name: "River Flow", artist: "Water Elements", mood: "Flowing", duration: "3:52", audioUrl: "https://cdn.pixabay.com/audio/2022/05/13/audio_af883c0440.mp3" },
  { id: "autumn-leaves", name: "Autumn Leaves", artist: "Seasonal Sounds", mood: "Nostalgic", duration: "4:18", audioUrl: "https://cdn.pixabay.com/audio/2022/08/23/audio_d33ab99b41.mp3" },
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
