interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  photographyTip: string;
}

interface WeatherCode {
  [key: number]: { description: string; icon: string; tip: string };
}

const weatherCodes: WeatherCode = {
  0: { description: "Clear sky", icon: "☀️", tip: "Perfect for golden hour shots! Try shooting during sunrise or sunset for warm, dramatic lighting." },
  1: { description: "Mainly clear", icon: "🌤️", tip: "Great lighting conditions! Experiment with shadows and contrast in your compositions." },
  2: { description: "Partly cloudy", icon: "⛅", tip: "Soft, diffused light ideal for portraits. The clouds add texture to sky shots." },
  3: { description: "Overcast", icon: "☁️", tip: "Even lighting perfect for street photography. Colors will appear more saturated." },
  45: { description: "Foggy", icon: "🌫️", tip: "Mysterious atmosphere! Use fog to create depth and mood in your landscape shots." },
  48: { description: "Foggy", icon: "🌫️", tip: "Atmospheric conditions for creative shots. Try silhouettes and minimalist compositions." },
  51: { description: "Light drizzle", icon: "🌦️", tip: "Capture reflections in puddles and raindrops on surfaces for unique perspectives." },
  61: { description: "Light rain", icon: "🌧️", tip: "Protect your camera! Rain creates beautiful textures - try macro shots of water droplets." },
  71: { description: "Light snow", icon: "🌨️", tip: "Winter wonderland! Overexpose slightly to keep snow white. Look for contrast with dark subjects." },
  80: { description: "Rain showers", icon: "🌦️", tip: "Dynamic weather! Capture the drama of changing skies and dramatic cloud formations." },
  95: { description: "Thunderstorm", icon: "⛈️", tip: "Stay safe! If possible, capture lightning with long exposures from a secure location." },
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

    return {
      temperature: temp,
      condition: weatherInfo.description,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      photographyTip: weatherInfo.tip,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
};
