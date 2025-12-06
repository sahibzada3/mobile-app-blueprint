import * as React from "react";

interface WeatherGraphicsProps {
  weatherCode: number;
  isNight: boolean;
}

export default function WeatherGraphics({ weatherCode, isNight }: WeatherGraphicsProps) {
  // Determine weather type - WMO weather codes
  // 0 = Clear sky, 1 = Mainly clear, 2 = Partly cloudy, 3 = Overcast
  const isClear = weatherCode <= 1; // 0-1 are clear/mainly clear
  const isPartlyCloudy = weatherCode === 2; // Only code 2 shows light clouds
  const isOvercast = weatherCode === 3; // Code 3 shows more clouds but still sunny vibe
  const isFoggy = weatherCode === 45 || weatherCode === 48;
  const isRainy = weatherCode >= 51 && weatherCode <= 82;
  const isSnowy = weatherCode >= 71 && weatherCode <= 77;
  const isStormy = weatherCode >= 95;
  
  // For daytime codes 0-3, always show sun
  const showSun = !isNight && weatherCode <= 3 && !isFoggy && !isRainy && !isStormy;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient based on time and weather */}
      <div className={`absolute inset-0 ${getBaseGradient(isNight, weatherCode)}`} />

      {/* Stars for night */}
      {isNight && <Stars intensity={weatherCode >= 45 ? 0.3 : 1} />}

      {/* Moon for night */}
      {isNight && weatherCode < 45 && <Moon />}

      {/* Sun for daytime - always show for codes 0-3 */}
      {showSun && <Sun isClear={isClear} />}

      {/* Very light clouds for partly cloudy (code 2) */}
      {!isNight && isPartlyCloudy && !isRainy && !isStormy && (
        <Clouds isNight={false} intensity={0.2} isStormy={false} isLight={true} />
      )}

      {/* Medium clouds for overcast (code 3) - still show sun through them */}
      {!isNight && isOvercast && !isRainy && !isStormy && (
        <Clouds isNight={false} intensity={0.4} isStormy={false} isLight={true} />
      )}

      {/* Heavy clouds for fog/rain/storm */}
      {(isFoggy || isRainy || isStormy) && (
        <Clouds isNight={isNight} intensity={1} isStormy={isStormy} isLight={false} />
      )}

      {/* Night clouds */}
      {isNight && (isPartlyCloudy || isOvercast) && <NightClouds />}

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
  
  // Clear sky - vibrant sunny blue/amber gradient
  if (weatherCode === 0) return "bg-gradient-to-br from-sky-400 via-cyan-300 to-amber-200";
  // Mainly clear - bright warm gradient
  if (weatherCode === 1) return "bg-gradient-to-br from-sky-300 via-cyan-200 to-amber-100";
  // Partly cloudy - still bright with slight softness
  if (weatherCode === 2) return "bg-gradient-to-br from-sky-300 via-blue-200 to-amber-100/80";
  // Overcast - warm but softer
  if (weatherCode === 3) return "bg-gradient-to-br from-sky-200 via-blue-100 to-amber-50";
  // Fog
  if (weatherCode === 45 || weatherCode === 48) return "bg-gradient-to-b from-slate-300 via-slate-200 to-slate-100";
  // Rain
  if (weatherCode >= 51 && weatherCode <= 82) return "bg-gradient-to-b from-slate-400 via-blue-300 to-slate-200";
  // Storm
  if (weatherCode >= 95) return "bg-gradient-to-b from-slate-600 via-purple-400 to-slate-400";
  
  return "bg-gradient-to-br from-sky-300 via-cyan-200 to-amber-100";
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

// Sun component - enhanced for clear days
function Sun({ isClear = true }: { isClear?: boolean }) {
  const size = isClear ? 'w-16 h-16' : 'w-14 h-14';
  const glowSize = isClear ? 'w-20 h-20' : 'w-16 h-16';
  const rayLength = isClear ? 'h-10' : 'h-6';
  
  return (
    <div className="absolute top-3 right-4">
      {/* Outer glow */}
      <div 
        className={`absolute -inset-2 ${glowSize} rounded-full bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-400 blur-xl opacity-70`}
        style={{ animation: 'sunPulse 3s ease-in-out infinite' }}
      />
      {/* Inner glow */}
      <div 
        className={`absolute inset-0 ${size} rounded-full bg-gradient-to-br from-amber-200 via-yellow-300 to-orange-300 blur-lg opacity-80`}
        style={{ animation: 'sunPulse 2s ease-in-out infinite' }}
      />
      {/* Sun core */}
      <div className={`relative ${size} rounded-full bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-400 shadow-[0_0_60px_rgba(251,191,36,0.8),0_0_100px_rgba(251,146,60,0.4)]`}>
        {/* Sun rays */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute top-1/2 left-1/2 w-1.5 ${rayLength} bg-gradient-to-t from-amber-400 via-yellow-300 to-transparent origin-bottom rounded-full`}
            style={{
              transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
              animation: `sunRay 2s ease-in-out ${i * 0.15}s infinite`,
              opacity: 0.9,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Clouds component - with light variant for partly cloudy
function Clouds({ isNight, intensity = 1, isStormy = false, isLight = false }: { isNight: boolean; intensity?: number; isStormy?: boolean; isLight?: boolean }) {
  const cloudColor = isNight 
    ? isStormy ? 'bg-slate-700/80' : 'bg-slate-600/60'
    : isLight 
      ? 'bg-white/40' // Light, wispy clouds for sunny days
      : isStormy ? 'bg-slate-500/70' : 'bg-white/70';
  
  const cloudCount = Math.max(1, Math.floor(3 * intensity));
  const cloudSize = isLight ? 0.6 : 1; // Smaller clouds for light mode

  return (
    <>
      {[...Array(cloudCount)].map((_, i) => (
        <div
          key={i}
          className={`absolute ${cloudColor} rounded-full ${isLight ? 'blur-md' : 'blur-sm'}`}
          style={{
            width: `${(40 + Math.random() * 50) * cloudSize}px`,
            height: `${(15 + Math.random() * 15) * cloudSize}px`,
            top: `${15 + Math.random() * 25}%`,
            left: `${10 + i * 35}%`,
            animation: `cloudFloat ${20 + Math.random() * 10}s linear infinite`,
            animationDelay: `${i * -6}s`,
            boxShadow: isStormy ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
          }}
        >
          {/* Cloud puffs - smaller for light clouds */}
          <div className={`absolute -top-2 left-3 w-${isLight ? '6' : '10'} h-${isLight ? '6' : '10'} ${cloudColor} rounded-full ${isLight ? 'blur-md' : 'blur-sm'}`} 
               style={{ width: `${8 * cloudSize}px`, height: `${8 * cloudSize}px` }} />
          <div className={`absolute -top-3 left-8 w-${isLight ? '8' : '12'} h-${isLight ? '8' : '12'} ${cloudColor} rounded-full ${isLight ? 'blur-md' : 'blur-sm'}`}
               style={{ width: `${10 * cloudSize}px`, height: `${10 * cloudSize}px` }} />
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
