export interface WeatherAtmosphereConfig {
  gradient: string;
  lightGradient: string;
  cardBg: string;
  cardBorder: string;
  glowColor: string;
  accentColor: string;
  particleType: 'none' | 'rain' | 'sunbeam' | 'snow' | 'clouds' | 'mist' | 'lightning';
}

export function getWeatherAtmosphere(condition: string, isDay: boolean = true): WeatherAtmosphereConfig {
  const cond = condition.toLowerCase();

  if (!isDay && (cond.includes('clear') || cond.includes('sunny'))) {
    return {
      gradient: 'from-[#09090b] via-indigo-950/60 to-[#09090b]',
      lightGradient: 'from-slate-100 via-indigo-100/40 to-zinc-50',
      cardBg: 'bg-slate-900/60',
      cardBorder: 'border-indigo-500/20',
      glowColor: 'rgba(99, 102, 241, 0.12)',
      accentColor: '#818cf8',
      particleType: 'sunbeam',
    };
  }

  if (cond.includes('thunder') || cond.includes('storm')) {
    return {
      gradient: 'from-[#09090b] via-purple-950/40 to-[#09090b]',
      lightGradient: 'from-slate-200 via-purple-100/50 to-zinc-50',
      cardBg: 'bg-slate-900/70',
      cardBorder: 'border-purple-500/30',
      glowColor: 'rgba(168, 85, 247, 0.18)',
      accentColor: '#c084fc',
      particleType: 'lightning',
    };
  }

  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
    return {
      gradient: 'from-[#09090b] via-cyan-950/40 to-[#09090b]',
      lightGradient: 'from-blue-100/60 via-cyan-50/50 to-zinc-50',
      cardBg: 'bg-slate-900/70',
      cardBorder: 'border-cyan-500/20',
      glowColor: 'rgba(6, 182, 212, 0.15)',
      accentColor: '#22d3ee',
      particleType: 'rain',
    };
  }

  if (cond.includes('snow') || cond.includes('sleet') || cond.includes('ice') || cond.includes('flurry')) {
    return {
      gradient: 'from-[#09090b] via-sky-950/30 to-[#09090b]',
      lightGradient: 'from-slate-100 via-sky-100/40 to-zinc-50',
      cardBg: 'bg-slate-900/70',
      cardBorder: 'border-sky-400/20',
      glowColor: 'rgba(56, 189, 248, 0.15)',
      accentColor: '#7dd3fc',
      particleType: 'snow',
    };
  }

  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) {
    return {
      gradient: 'from-[#09090b] via-zinc-900/60 to-[#09090b]',
      lightGradient: 'from-zinc-100 via-slate-100/80 to-zinc-50',
      cardBg: 'bg-slate-900/70',
      cardBorder: 'border-slate-500/20',
      glowColor: 'rgba(148, 163, 184, 0.12)',
      accentColor: '#94a3b8',
      particleType: 'mist',
    };
  }

  if (cond.includes('cloud') || cond.includes('overcast')) {
    return {
      gradient: 'from-[#09090b] via-slate-900/80 to-[#09090b]',
      lightGradient: 'from-slate-100 via-blue-50/50 to-zinc-50',
      cardBg: 'bg-slate-900/65',
      cardBorder: 'border-slate-700/50',
      glowColor: 'rgba(100, 116, 139, 0.12)',
      accentColor: '#38bdf8',
      particleType: 'clouds',
    };
  }

  // Clear / Sunny daytime default
  return {
    gradient: 'from-[#09090b] via-amber-950/20 to-[#09090b]',
    lightGradient: 'from-sky-100/70 via-amber-50/40 to-zinc-50',
    cardBg: 'bg-slate-900/60',
    cardBorder: 'border-amber-500/20',
    glowColor: 'rgba(245, 158, 11, 0.12)',
    accentColor: '#fbbf24',
    particleType: 'sunbeam',
  };
}
