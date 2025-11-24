import * as React from "react";
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
  isNight: boolean;
}

export default function WeatherWidget() {
  const navigate = useNavigate();
  const [weather, setWeather] = React.useState<WeatherWidgetData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchWeatherData();
    
    // Auto-refresh weather every 30 minutes
    const interval = setInterval(() => {
      fetchWeatherData();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
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
        photographyTip: getPhotographyTip(weatherCode, isNight),
        isNight
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
    if (isNight) {
      const nightTips = [
        "Capture city lights and urban nightscapes",
        "Perfect for long exposure light trails",
        "Try moon photography with telephoto lens",
        "Experiment with reflections in water bodies",
        "Shoot illuminated architecture and buildings",
        "Capture star trails with long exposure",
        "Try silhouette photography with city backdrop",
        "Perfect for night street photography"
      ];
      
      if (code === 0 || code === 1) {
        const clearNightTips = [
          "Perfect for astrophotography and Milky Way",
          "Capture moon details with telephoto lens",
          "Try star trail photography",
          "Shoot cityscapes with starry skies",
          "Perfect for light painting techniques"
        ];
        return clearNightTips[Math.floor(Math.random() * clearNightTips.length)];
      }
      
      return nightTips[Math.floor(Math.random() * nightTips.length)];
    }
    
    const dayTips: { [key: number]: string[] } = {
      0: [
        "Golden hour magic - shoot 1 hour before sunset",
        "Perfect for dramatic landscape photography",
        "Try high-contrast architectural photography",
        "Capture vibrant nature colors"
      ],
      1: [
        "Soft clouds create diffused lighting",
        "Great for outdoor portraits",
        "Try cloud formations and sky photography",
        "Perfect for cityscape photography"
      ],
      2: [
        "Soft light ideal for portrait photography",
        "Capture dramatic cloud formations",
        "Great for moody landscape shots",
        "Try silhouette photography"
      ],
      3: [
        "Even lighting perfect for street photography",
        "Great for capturing urban life",
        "Try architectural detail shots",
        "Moody atmosphere for creative shots"
      ],
      45: [
        "Mysterious fog creates atmospheric shots",
        "Perfect for moody forest photography",
        "Try minimalist landscape compositions",
        "Capture ethereal morning scenes"
      ],
      61: [
        "Capture reflections in rain puddles",
        "Try raindrop macro photography",
        "Shoot through rain-covered windows",
        "Urban rain photography opportunities"
      ],
      71: [
        "Winter wonderland landscape photography",
        "Capture falling snow with fast shutter",
        "Try snow-covered architecture",
        "Perfect for minimalist white compositions"
      ]
    };
    
    const tips = dayTips[code] || ["Great conditions for photography today!"];
    return tips[Math.floor(Math.random() * tips.length)];
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

  const cardClassName = weather.isNight 
    ? "shadow-2xl border-0 bg-black cursor-pointer hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-500 overflow-hidden group relative text-white"
    : "shadow-lg border-0 bg-gradient-to-br from-primary/10 via-card to-accent/10 cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group relative";

  return (
    <Card 
      className={cardClassName}
      onClick={() => navigate("/weather")}
    >
      {/* Night Sky with Stars */}
      {weather.isNight && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-black via-blue-950/20 to-black">
          {/* Small twinkling stars */}
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 4}s`,
                opacity: 0.4 + Math.random() * 0.6,
                boxShadow: '0 0 2px rgba(255, 255, 255, 0.6)',
              }}
            />
          ))}
          {/* Bright stars */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`bright-${i}`}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${1.5 + Math.random() * 3}s`,
                opacity: 0.6 + Math.random() * 0.4,
                boxShadow: '0 0 6px rgba(255, 255, 255, 0.9), 0 0 12px rgba(255, 255, 255, 0.5)',
              }}
            />
          ))}
          {/* Shooting stars */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`shooting-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
              style={{
                width: '100px',
                top: `${20 + Math.random() * 60}%`,
                left: '-100px',
                animation: `shooting-star ${8 + Math.random() * 12}s ${Math.random() * 10}s infinite`,
                transform: 'rotate(-45deg)',
              }}
            />
          ))}
        </div>
      )}
      
      {/* Decorative Background Pattern */}
      {!weather.isNight && (
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(0,0,0,0.1)_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      )}
      
      <CardContent className="p-5 relative z-10">
        {/* Header with Location */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              weather.isNight ? 'bg-white/10' : 'bg-primary/10'
            }`}>
              <MapPin className={`w-4 h-4 ${weather.isNight ? 'text-white' : 'text-primary'}`} strokeWidth={2.5} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${weather.isNight ? 'text-white' : 'text-foreground'}`}>
                {weather.location}
              </p>
              <p className={`text-xs ${weather.isNight ? 'text-white/60' : 'text-muted-foreground'}`}>
                Current Conditions
              </p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 transition-all ${
            weather.isNight 
              ? 'text-white/60 group-hover:text-white group-hover:translate-x-1' 
              : 'text-muted-foreground group-hover:text-primary group-hover:translate-x-1'
          }`} />
        </div>

        {/* Main Temperature Display */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3">
            <div className="text-7xl leading-none filter drop-shadow-lg">{weather.icon}</div>
            <div className="pt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-5xl font-bold tracking-tight ${
                  weather.isNight ? 'text-white' : 'text-foreground'
                }`}>
                  {weather.temperature}
                </span>
                <span className={`text-2xl font-medium ${
                  weather.isNight ? 'text-white/60' : 'text-muted-foreground'
                }`}>
                  °C
                </span>
              </div>
              <Badge variant="secondary" className={`mt-2 font-medium ${
                weather.isNight 
                  ? 'bg-white/10 text-white border-white/20' 
                  : 'bg-primary/15 text-primary border-primary/30'
              }`}>
                {weather.condition}
              </Badge>
            </div>
          </div>
        </div>

        {/* Photography Tip */}
        <div className={`rounded-xl p-3 mb-4 ${
          weather.isNight 
            ? 'bg-white/5 border border-white/10' 
            : 'bg-accent/10 border border-accent/20'
        }`}>
          <div className="flex items-start gap-2">
            <Camera className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              weather.isNight ? 'text-white' : 'text-accent'
            }`} strokeWidth={2.5} />
            <p className={`text-sm font-medium leading-relaxed ${
              weather.isNight ? 'text-white' : 'text-foreground'
            }`}>
              {weather.photographyTip}
            </p>
          </div>
        </div>

        {/* Sun Times */}
        <div className="flex items-center gap-4">
          <div className={`flex-1 rounded-lg p-3 border ${
            weather.isNight 
              ? 'bg-white/5 border-white/10' 
              : 'bg-gradient-to-br from-accent/5 to-transparent border-border/50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Sunrise className={`w-4 h-4 ${
                weather.isNight ? 'text-white/80' : 'text-accent'
              }`} strokeWidth={2.5} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                weather.isNight ? 'text-white/60' : 'text-muted-foreground'
              }`}>
                Sunrise
              </span>
            </div>
            <p className={`text-base font-bold ${
              weather.isNight ? 'text-white' : 'text-foreground'
            }`}>
              {weather.sunrise}
            </p>
          </div>
          <div className={`flex-1 rounded-lg p-3 border ${
            weather.isNight 
              ? 'bg-white/5 border-white/10' 
              : 'bg-gradient-to-br from-primary/5 to-transparent border-border/50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Sunset className={`w-4 h-4 ${
                weather.isNight ? 'text-white/80' : 'text-primary'
              }`} strokeWidth={2.5} />
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                weather.isNight ? 'text-white/60' : 'text-muted-foreground'
              }`}>
                Sunset
              </span>
            </div>
            <p className={`text-base font-bold ${
              weather.isNight ? 'text-white' : 'text-foreground'
            }`}>
              {weather.sunset}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
