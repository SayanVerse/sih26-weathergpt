export function formatHour(timeStr: string): string {
  try {
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      const hour = parseInt(parts[0], 10);
      if (isNaN(hour)) return timeStr;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${displayHour} ${period}`;
    }
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    }
    return timeStr;
  } catch {
    return timeStr;
  }
}

export function formatDayName(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return d.toLocaleDateString([], { weekday: 'short' });
  } catch {
    return dateStr;
  }
}

export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getWindDirectionLabel(deg: number | string): string {
  if (typeof deg === 'string') return deg;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return directions[index] || 'N';
}
