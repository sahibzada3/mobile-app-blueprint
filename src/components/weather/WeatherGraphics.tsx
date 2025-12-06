import * as React from "react";

interface WeatherGraphicsProps {
  weatherCode: number;
  isNight: boolean;
}

export default function WeatherGraphics({ weatherCode, isNight }: WeatherGraphicsProps) {
  // Determine weather type - WMO weather codes
  // 0 = Clear sky, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
  const isClear = weatherCode === 0 || weatherCode === 1;
  const isPartlyCloudy = weatherCode === 2 || weatherCode === 3; // Show sun with some clouds for 2-3
  const isOvercast = weatherCode >= 45; // Only truly overcast for fog, rain, etc.
  const isFoggy = weatherCode === 45 || weatherCode === 48;
  const isRainy = weatherCode >= 51 && weatherCode <= 82; // All rain/drizzle codes
  const isSnowy = weatherCode >= 71 && weatherCode <= 77; // All snow codes
  const isStormy = weatherCode >= 95; // Thunderstorm codes

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient based on time and weather */}
      <div className={`absolute inset-0 ${getBaseGradient(isNight, weatherCode)}`} />

      {/* Stars for night */}
      {isNight && <Stars intensity={isOvercast ? 0.3 : 1} />}

      {/* Moon for night */}
      {isNight && !isOvercast && <Moon />}

      {/* Sun for clear/partly cloudy day - always show sun unless truly overcast */}
      {!isNight && (isClear || isPartlyCloudy) && !isOvercast && <Sun />}

      {/* Light clouds for partly cloudy - small, sparse clouds that don't block sun */}
      {isPartlyCloudy && !isOvercast && !isRainy && !isStormy && (
        <Clouds isNight={isNight} intensity={0.3} isStormy={false} />
      )}

      {/* Heavy clouds for overcast/rain/storm */}
      {(isOvercast || isRainy || isStormy) && (
        <Clouds isNight={isNight} intensity={1} isStormy={isStormy} />
      )}

      {/* Night clouds */}
      {isNight && isPartlyCloudy && <NightClouds />}

      {/* Rain */}
      {isRainy && <Rain isNight={isNight} />}

      {/* Storm lightning */}
      {isStormy && <Lightning />}

      {/* Snow */}
      {isSnowy && <Snow />}

      {/* Fog */}
      {isFoggy && <Fog isNight={isNight} />}
    </div>
  );
}

function getBaseGradient(isNight: boolean, weatherCode: number): string {
  if (isNight) {
    if (weatherCode >= 45) return "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900";
    if (weatherCode >= 51) return "bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900";
    return "bg-gradient-to-b from-indigo-950 via-slate-900 to-black";
  }
  
  // Clear and mainly clear - bright sunny gradient
  if (weatherCode === 0 || weatherCode === 1) return "bg-gradient-to-b from-cyan-400/20 via-sky-300/10 to-amber-200/10";
  // Partly cloudy to overcast - still show some warmth
  if (weatherCode === 2 || weatherCode === 3) return "bg-gradient-to-b from-sky-400/15 via-amber-100/10 to-white/5";
  // Fog
  if (weatherCode === 45 || weatherCode === 48) return "bg-gradient-to-b from-slate-400/20 via-slate-300/15 to-slate-200/10";
  // Rain
  if (weatherCode >= 51 && weatherCode <= 82) return "bg-gradient-to-b from-slate-500/20 via-blue-400/10 to-slate-300/10";
  // Storm
  if (weatherCode >= 95) return "bg-gradient-to-b from-slate-700/30 via-purple-900/20 to-slate-600/20";
  
  return "bg-gradient-to-b from-sky-300/10 to-transparent";
}

// Stars component
function Stars({ intensity = 1 }: { intensity?: number }) {
  const starCount = Math.floor(60 * intensity);
  const brightStarCount = Math.floor(20 * intensity);

  return (
    <>
      {/* Small twinkling stars */}
      {[...Array(starCount)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: `${1 + Math.random() * 1.5}px`,
            height: `${1 + Math.random() * 1.5}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 4}s`,
            opacity: (0.3 + Math.random() * 0.5) * intensity,
            boxShadow: '0 0 2px rgba(255, 255, 255, 0.5)',
          }}
        />
      ))}
      {/* Bright stars */}
      {[...Array(brightStarCount)].map((_, i) => (
        <div
          key={`bright-${i}`}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: `${2 + Math.random() * 2}px`,
            height: `${2 + Math.random() * 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${1.5 + Math.random() * 3}s`,
            opacity: (0.5 + Math.random() * 0.5) * intensity,
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
    </>
  );
}

// Moon component
function Moon() {
  return (
    <div className="absolute top-4 right-6">
      <div 
        className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 via-yellow-50 to-slate-200 shadow-[0_0_30px_rgba(255,255,200,0.4),0_0_60px_rgba(255,255,200,0.2)]"
        style={{
          animation: 'moonGlow 4s ease-in-out infinite',
        }}
      >
        {/* Moon craters */}
        <div className="absolute top-2 left-3 w-2 h-2 rounded-full bg-slate-300/40" />
        <div className="absolute top-5 left-6 w-3 h-3 rounded-full bg-slate-300/30" />
        <div className="absolute top-7 left-2 w-1.5 h-1.5 rounded-full bg-slate-300/35" />
      </div>
    </div>
  );
}

// Sun component
function Sun() {
  return (
    <div className="absolute top-3 right-4">
      {/* Sun glow */}
      <div 
        className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-yellow-300 to-orange-300 blur-lg opacity-60"
        style={{ animation: 'sunPulse 3s ease-in-out infinite' }}
      />
      {/* Sun core */}
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 shadow-[0_0_40px_rgba(251,191,36,0.6)]">
        {/* Sun rays */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-t from-amber-400/80 to-transparent origin-bottom"
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
              animation: `sunRay 2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Clouds component
function Clouds({ isNight, intensity = 1, isStormy = false }: { isNight: boolean; intensity?: number; isStormy?: boolean }) {
  const cloudColor = isNight 
    ? isStormy ? 'bg-slate-700/80' : 'bg-slate-600/60'
    : isStormy ? 'bg-slate-500/70' : 'bg-white/70';
  
  const cloudCount = Math.floor(4 * intensity);

  return (
    <>
      {[...Array(cloudCount)].map((_, i) => (
        <div
          key={i}
          className={`absolute ${cloudColor} rounded-full blur-sm`}
          style={{
            width: `${60 + Math.random() * 80}px`,
            height: `${25 + Math.random() * 20}px`,
            top: `${10 + Math.random() * 30}%`,
            left: `${-20 + i * 30}%`,
            animation: `cloudFloat ${15 + Math.random() * 10}s linear infinite`,
            animationDelay: `${i * -5}s`,
            boxShadow: isStormy ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {/* Cloud puffs */}
          <div className={`absolute -top-3 left-4 w-10 h-10 ${cloudColor} rounded-full blur-sm`} />
          <div className={`absolute -top-5 left-12 w-12 h-12 ${cloudColor} rounded-full blur-sm`} />
          <div className={`absolute -top-2 right-4 w-8 h-8 ${cloudColor} rounded-full blur-sm`} />
        </div>
      ))}
    </>
  );
}

// Night clouds - darker, more atmospheric
function NightClouds() {
  return (
    <>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-slate-800/50 rounded-full blur-md"
          style={{
            width: `${80 + Math.random() * 100}px`,
            height: `${30 + Math.random() * 25}px`,
            top: `${15 + Math.random() * 35}%`,
            left: `${-30 + i * 40}%`,
            animation: `cloudFloat ${20 + Math.random() * 10}s linear infinite`,
            animationDelay: `${i * -7}s`,
          }}
        >
          <div className="absolute -top-4 left-6 w-12 h-12 bg-slate-800/40 rounded-full blur-md" />
          <div className="absolute -top-6 left-16 w-14 h-14 bg-slate-800/45 rounded-full blur-md" />
        </div>
      ))}
    </>
  );
}

// Rain component
function Rain({ isNight }: { isNight: boolean }) {
  const rainColor = isNight ? 'bg-blue-300/40' : 'bg-blue-400/50';
  
  return (
    <>
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-0.5 ${rainColor} rounded-full`}
          style={{
            height: `${15 + Math.random() * 20}px`,
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animation: `rainFall ${0.5 + Math.random() * 0.3}s linear infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      {/* Rain splash effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-blue-400/10 to-transparent" />
    </>
  );
}

// Lightning component
function Lightning() {
  return (
    <div 
      className="absolute inset-0 bg-white/0"
      style={{
        animation: 'lightning 8s ease-in-out infinite',
      }}
    />
  );
}

// Snow component
function Snow() {
  return (
    <>
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: `${3 + Math.random() * 4}px`,
            height: `${3 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: '-10px',
            opacity: 0.6 + Math.random() * 0.4,
            animation: `snowFall ${3 + Math.random() * 4}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
          }}
        />
      ))}
    </>
  );
}

// Fog component
function Fog({ isNight }: { isNight: boolean }) {
  const fogColor = isNight ? 'bg-slate-400/20' : 'bg-white/40';
  
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`absolute ${fogColor} blur-xl`}
          style={{
            width: '200%',
            height: `${40 + Math.random() * 30}px`,
            top: `${20 + i * 20}%`,
            left: '-50%',
            animation: `fogDrift ${25 + Math.random() * 15}s linear infinite`,
            animationDelay: `${i * -8}s`,
          }}
        />
      ))}
    </>
  );
}
