import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Thermometer, 
  Sunrise, 
  Sunset, 
  CloudRain, 
  Wind, 
  Droplets, 
  Camera, 
  Clock, 
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface WeatherRecommendation {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: string;
  sunrise: string;
  sunset: string;
  goldenHourMorning: { start: string; end: string };
  goldenHourEvening: { start: string; end: string };
  blueHourMorning: { start: string; end: string };
  blueHourEvening: { start: string; end: string };
  recommendations: Array<{
    title: string;
    description: string;
    icon: string;
    bestTime: string;
  }>;
}

export default function WeatherRecommendations() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherRecommendation | null>(null);

  useEffect(() => {
    fetchWeatherRecommendations();
  }, []);

  const fetchWeatherRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;

      // Fetch weather and astronomical data
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=auto`
      );

      if (!response.ok) throw new Error("Failed to fetch weather data");

      const data = await response.json();

      // Get location name using reverse geocoding
      const locationResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const locationData = await locationResponse.json();
      const location = locationData.city || locationData.locality || "Unknown Location";

      // Calculate golden hour and blue hour times
      const sunrise = new Date(data.daily.sunrise[0]);
      const sunset = new Date(data.daily.sunset[0]);

      const goldenHourMorning = {
        start: new Date(sunrise.getTime() - 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        end: new Date(sunrise.getTime() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      const goldenHourEvening = {
        start: new Date(sunset.getTime() - 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        end: new Date(sunset.getTime() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      const blueHourMorning = {
        start: new Date(sunrise.getTime() - 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        end: new Date(sunrise.getTime() - 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      const blueHourEvening = {
        start: new Date(sunset.getTime() + 30 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        end: new Date(sunset.getTime() + 60 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      const weatherCode = data.current.weather_code;
      const recommendations = getPhotographyRecommendations(
        weatherCode,
        data.current.temperature_2m,
        data.current.wind_speed_10m,
        data.current.relative_humidity_2m
      );

      setWeatherData({
        temperature: Math.round(data.current.temperature_2m),
        condition: getWeatherCondition(weatherCode),
        icon: getWeatherIcon(weatherCode),
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        location,
        sunrise: sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sunset: sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        goldenHourMorning,
        goldenHourEvening,
        blueHourMorning,
        blueHourEvening,
        recommendations
      });

    } catch (err: any) {
      console.error("Error fetching weather:", err);
      setError(err.message === "User denied Geolocation" 
        ? "Location permission denied. Please enable location access to get weather recommendations."
        : "Failed to load weather data. Please try again."
      );
      toast.error("Could not load weather recommendations");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherCondition = (code: number): string => {
    const conditions: { [key: number]: string } = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Foggy",
      51: "Light Drizzle",
      61: "Light Rain",
      71: "Light Snow",
      80: "Rain Showers",
      95: "Thunderstorm"
    };
    return conditions[code] || "Clear Sky";
  };

  const getWeatherIcon = (code: number): string => {
    const icons: { [key: number]: string } = {
      0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
      45: "🌫️", 48: "🌫️", 51: "🌦️", 61: "🌧️",
      71: "🌨️", 80: "🌦️", 95: "⛈️"
    };
    return icons[code] || "☀️";
  };

  const getPhotographyRecommendations = (
    weatherCode: number,
    temp: number,
    windSpeed: number,
    humidity: number
  ) => {
    const recommendations = [];

    // Weather-based recommendations
    if (weatherCode === 0 || weatherCode === 1) {
      recommendations.push({
        title: "Golden Hour Photography",
        description: "Perfect clear conditions for stunning golden hour shots. The warm light will create beautiful tones and long shadows.",
        icon: "🌅",
        bestTime: "Sunrise & Sunset"
      });
    }

    if (weatherCode === 2) {
      recommendations.push({
        title: "Cloud Texture Shots",
        description: "Partially cloudy skies add drama and depth. Great for landscape photography with interesting cloud formations.",
        icon: "🌤️",
        bestTime: "All Day"
      });
    }

    if (weatherCode === 3) {
      recommendations.push({
        title: "Even Lighting Photography",
        description: "Overcast conditions provide soft, even lighting ideal for portraits and macro photography. Colors appear more saturated.",
        icon: "☁️",
        bestTime: "Midday"
      });
    }

    if (weatherCode === 45 || weatherCode === 48) {
      recommendations.push({
        title: "Atmospheric Fog Shots",
        description: "Fog creates mysterious, moody atmospheres. Perfect for minimalist compositions and silhouettes.",
        icon: "🌫️",
        bestTime: "Early Morning"
      });
    }

    if (weatherCode >= 51 && weatherCode <= 61) {
      recommendations.push({
        title: "Raindrop Macro Photography",
        description: "Capture water droplets on leaves, flowers, or surfaces. Use protective gear for your camera.",
        icon: "💧",
        bestTime: "During/After Rain"
      });
    }

    if (temp < 5) {
      recommendations.push({
        title: "Winter Wonderland",
        description: "Cold conditions may bring frost or snow. Look for ice crystals, frozen textures, and winter landscapes.",
        icon: "❄️",
        bestTime: "Morning"
      });
    }

    if (windSpeed > 15) {
      recommendations.push({
        title: "Motion Blur Effects",
        description: "Strong winds create movement. Use slower shutter speeds to capture flowing grass, trees, or clouds.",
        icon: "💨",
        bestTime: "Afternoon"
      });
    }

    if (humidity > 80) {
      recommendations.push({
        title: "Misty Landscape Photography",
        description: "High humidity can create mist and haze. Perfect for ethereal landscape shots with soft, dreamy quality.",
        icon: "🌊",
        bestTime: "Dawn"
      });
    }

    // Always include a wildlife recommendation
    recommendations.push({
      title: "Wildlife Activity",
      description: "Animals are most active during golden hours. Look for birds, insects, and other wildlife in natural settings.",
      icon: "🦋",
      bestTime: "Dawn & Dusk"
    });

    return recommendations.slice(0, 4); // Return top 4 recommendations
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading weather recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="w-6 h-6" />
              <CardTitle>Unable to Load</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={fetchWeatherRecommendations} className="w-full">
              Try Again
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-primary">Weather Forecast</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Current Weather Card */}
        <Card className="shadow-nature border-0 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-5">{weatherData.icon}</div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{weatherData.location}</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl font-bold">{weatherData.temperature}°</span>
                  <span className="text-2xl text-muted-foreground">C</span>
                </div>
                <p className="text-xl text-muted-foreground mt-2">{weatherData.condition}</p>
              </div>
              <div className="text-6xl">{weatherData.icon}</div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-semibold">{weatherData.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-semibold">{weatherData.windSpeed} km/h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Feels Like</p>
                  <p className="font-semibold">{weatherData.temperature}°</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimal Shooting Times */}
        <Card className="shadow-nature border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Optimal Shooting Times
            </CardTitle>
            <CardDescription>Best times for nature photography today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sun Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-accent/10 to-transparent">
                <Sunrise className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Sunrise</p>
                  <p className="font-bold text-lg">{weatherData.sunrise}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-primary/10 to-transparent">
                <Sunset className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Sunset</p>
                  <p className="font-bold text-lg">{weatherData.sunset}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Golden Hours */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Golden Hour
                </Badge>
                <span className="text-sm text-muted-foreground">Warm, dramatic lighting</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <p className="text-xs text-muted-foreground mb-1">Morning</p>
                  <p className="font-semibold">{weatherData.goldenHourMorning.start} - {weatherData.goldenHourMorning.end}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <p className="text-xs text-muted-foreground mb-1">Evening</p>
                  <p className="font-semibold">{weatherData.goldenHourEvening.start} - {weatherData.goldenHourEvening.end}</p>
                </div>
              </div>
            </div>

            {/* Blue Hours */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Blue Hour
                </Badge>
                <span className="text-sm text-muted-foreground">Cool, ethereal tones</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">Before Sunrise</p>
                  <p className="font-semibold">{weatherData.blueHourMorning.start} - {weatherData.blueHourMorning.end}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">After Sunset</p>
                  <p className="font-semibold">{weatherData.blueHourEvening.start} - {weatherData.blueHourEvening.end}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photography Recommendations */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Photography Recommendations
          </h2>
          {weatherData.recommendations.map((rec, index) => (
            <Card key={index} className="shadow-nature border-0 hover-scale cursor-pointer transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{rec.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{rec.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {rec.bestTime}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="shadow-nature border-0 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-6 text-center">
            <Camera className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-bold text-lg mb-2">Ready to Capture?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Current conditions are perfect for nature photography
            </p>
            <Button 
              onClick={() => navigate("/camera")} 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Shooting
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
