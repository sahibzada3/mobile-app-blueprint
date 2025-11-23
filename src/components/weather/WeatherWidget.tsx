import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sunrise, Sunset, Camera, ChevronRight, Loader2, Cloud, Droplets, Wind, Eye } from "lucide-react";

interface WeatherWidgetData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  sunrise: string;
  sunset: string;
  photographyTip: string;
}

export default function WeatherWidget() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherWidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=auto`
      );

      if (!response.ok) throw new Error("Failed to fetch weather");

      const data = await response.json();

      // Get location name
      const locationResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const locationData = await locationResponse.json();
      const location = locationData.city || locationData.locality || "Your Location";

      const weatherCode = data.current.weather_code;
      const sunrise = new Date(data.daily.sunrise[0]);
      const sunset = new Date(data.daily.sunset[0]);
      const currentTime = new Date(data.current.time);
      const isNight = currentTime < sunrise || currentTime > sunset;

      setWeather({
        temperature: Math.round(data.current.temperature_2m),
        condition: getWeatherCondition(weatherCode),
        icon: getWeatherIcon(weatherCode, isNight),
        location,
        sunrise: sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sunset: sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        photographyTip: getPhotographyTip(weatherCode, isNight)
      });
    } catch (error) {
      console.error("Weather widget error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherCondition = (code: number): string => {
    const conditions: { [key: number]: string } = {
      0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
      45: "Foggy", 48: "Foggy", 51: "Drizzle", 61: "Rain",
      71: "Snow", 80: "Showers", 95: "Thunderstorm"
    };
    return conditions[code] || "Clear Sky";
  };

  const getWeatherIcon = (code: number, isNight: boolean): string => {
    if (isNight) {
      const nightIcons: { [key: number]: string } = {
        0: "🌙", 1: "🌙", 2: "☁️", 3: "☁️",
        45: "🌫️", 48: "🌫️", 51: "🌧️", 61: "🌧️",
        71: "🌨️", 80: "🌧️", 95: "⛈️"
      };
      return nightIcons[code] || "🌙";
    }
    const dayIcons: { [key: number]: string } = {
      0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
      45: "🌫️", 48: "🌫️", 51: "🌦️", 61: "🌧️",
      71: "🌨️", 80: "🌦️", 95: "⛈️"
    };
    return dayIcons[code] || "☀️";
  };

  const getPhotographyTip = (code: number, isNight: boolean): string => {
    if (isNight && (code === 0 || code === 1)) {
      return "Perfect for night sky and star photography!";
    }
    const tips: { [key: number]: string } = {
      0: "Perfect for golden hour shots!",
      1: "Great lighting conditions today",
      2: "Soft light ideal for portraits",
      3: "Even lighting for street photography",
      45: "Mysterious fog - perfect for atmosphere",
      61: "Capture reflections in the rain",
      71: "Winter wonderland awaits!"
    };
    return tips[code] || "Great day for photography!";
  };

  if (loading) {
    return (
      <Card className="shadow-nature border-0">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card 
      className="shadow-lg border-0 bg-gradient-to-br from-primary/10 via-card to-accent/10 cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
      onClick={() => navigate("/weather")}
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      <CardContent className="p-5 relative z-10">
        {/* Header with Location */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{weather.location}</p>
              <p className="text-xs text-muted-foreground">Current Conditions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        {/* Main Temperature Display */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3">
            <div className="text-7xl leading-none filter drop-shadow-lg">{weather.icon}</div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">{weather.temperature}</span>
                <span className="text-2xl text-muted-foreground font-medium">°C</span>
              </div>
              <Badge variant="secondary" className="mt-2 bg-primary/15 text-primary border-primary/30 font-medium">
                {weather.condition}
              </Badge>
            </div>
          </div>
        </div>

        {/* Photography Tip */}
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <Camera className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            <p className="text-sm text-foreground font-medium leading-relaxed">{weather.photographyTip}</p>
          </div>
        </div>

        {/* Sun Times */}
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gradient-to-br from-accent/5 to-transparent rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Sunrise className="w-4 h-4 text-accent" strokeWidth={2.5} />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sunrise</span>
            </div>
            <p className="text-base font-bold text-foreground">{weather.sunrise}</p>
          </div>
          <div className="flex-1 bg-gradient-to-br from-primary/5 to-transparent rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Sunset className="w-4 h-4 text-primary" strokeWidth={2.5} />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sunset</span>
            </div>
            <p className="text-base font-bold text-foreground">{weather.sunset}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
