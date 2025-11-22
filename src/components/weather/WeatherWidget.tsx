import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Sunrise, Sunset, Camera, ChevronRight, Loader2 } from "lucide-react";

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
      className="shadow-nature border-0 bg-gradient-to-br from-primary/5 via-card to-accent/5 cursor-pointer hover-scale transition-all"
      onClick={() => navigate("/weather")}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{weather.location}</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{weather.temperature}°</span>
            <span className="text-lg text-muted-foreground">C</span>
          </div>
          <div className="text-5xl">{weather.icon}</div>
        </div>

        <Badge variant="secondary" className="mb-3 bg-primary/10 text-primary border-primary/20">
          <Camera className="w-3 h-3 mr-1" />
          {weather.condition}
        </Badge>

        <p className="text-sm text-muted-foreground mb-3">{weather.photographyTip}</p>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <Sunrise className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">{weather.sunrise}</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunset className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{weather.sunset}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
