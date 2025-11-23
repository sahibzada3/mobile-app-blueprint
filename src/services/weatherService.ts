interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  photographyTip: string;
}

interface WeatherCode {
  [key: number]: { description: string; icon: string; iconNight: string; tip: string; tipNight: string };
}

const weatherCodes: WeatherCode = {
  0: { description: "Clear sky", icon: "☀️", iconNight: "🌙", tip: "Perfect for golden hour shots! Try shooting during sunrise or sunset for warm, dramatic lighting.", tipNight: "Perfect for night sky and star photography!" },
  1: { description: "Mainly clear", icon: "🌤️", iconNight: "🌙", tip: "Great lighting conditions! Experiment with shadows and contrast in your compositions.", tipNight: "Great for night photography and star trails!" },
  2: { description: "Partly cloudy", icon: "⛅", iconNight: "☁️", tip: "Soft, diffused light ideal for portraits. The clouds add texture to sky shots.", tipNight: "Soft, diffused light ideal for night scenes." },
  3: { description: "Overcast", icon: "☁️", iconNight: "☁️", tip: "Even lighting perfect for street photography. Colors will appear more saturated.", tipNight: "Even lighting perfect for night street photography." },
  45: { description: "Foggy", icon: "🌫️", iconNight: "🌫️", tip: "Mysterious atmosphere! Use fog to create depth and mood in your landscape shots.", tipNight: "Mysterious atmosphere! Use fog to create depth and mood in your night shots." },
  48: { description: "Foggy", icon: "🌫️", iconNight: "🌫️", tip: "Atmospheric conditions for creative shots. Try silhouettes and minimalist compositions.", tipNight: "Atmospheric conditions for creative night shots." },
  51: { description: "Light drizzle", icon: "🌦️", iconNight: "🌧️", tip: "Capture reflections in puddles and raindrops on surfaces for unique perspectives.", tipNight: "Capture city lights reflections in puddles." },
  61: { description: "Light rain", icon: "🌧️", iconNight: "🌧️", tip: "Protect your camera! Rain creates beautiful textures - try macro shots of water droplets.", tipNight: "Protect your camera! Capture rain and city lights." },
  71: { description: "Light snow", icon: "🌨️", iconNight: "🌨️", tip: "Winter wonderland! Overexpose slightly to keep snow white. Look for contrast with dark subjects.", tipNight: "Winter wonderland! Capture snow under street lights." },
  80: { description: "Rain showers", icon: "🌦️", iconNight: "🌧️", tip: "Dynamic weather! Capture the drama of changing skies and dramatic cloud formations.", tipNight: "Dynamic weather! Capture the drama of rain at night." },
  95: { description: "Thunderstorm", icon: "⛈️", iconNight: "⛈️", tip: "Stay safe! If possible, capture lightning with long exposures from a secure location.", tipNight: "Stay safe! Capture lightning with long exposures." },
};

export const getWeatherData = async (): Promise<WeatherData | null> => {
  try {
    // Get user's location
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;

    // Fetch weather from Open-Meteo API (free, no API key needed)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`
    );

    if (!response.ok) throw new Error("Weather fetch failed");

    const data = await response.json();
    const weatherCode = data.current.weather_code;
    const temp = Math.round(data.current.temperature_2m);

    const weatherInfo = weatherCodes[weatherCode] || weatherCodes[0];
    
    // Check if it's night time (simplified check without sunrise/sunset)
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    return {
      temperature: temp,
      condition: weatherInfo.description,
      description: weatherInfo.description,
      icon: isNight ? weatherInfo.iconNight : weatherInfo.icon,
      photographyTip: isNight ? weatherInfo.tipNight : weatherInfo.tip,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
};
