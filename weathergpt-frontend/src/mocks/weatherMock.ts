import {
  CurrentWeatherResponse,
  HourlyForecastResponse,
  DailyForecastResponse,
  WeatherAlertsResponse,
  AIInsightData,
  LocationInfo,
} from '../types/weather';

export function getMockCurrentWeather(location: LocationInfo): CurrentWeatherResponse {
  // Derive deterministic realistic weather from latitude
  const lat = location.latitude;
  const isTropical = Math.abs(lat) < 25;
  const isCold = Math.abs(lat) > 50;

  const baseTemp = isTropical ? 29 : isCold ? 8 : 19;
  const condition = isTropical ? 'Partly Cloudy' : isCold ? 'Cloudy' : 'Clear';
  const desc = isTropical ? 'Warm tropical breeze with scattered clouds' : isCold ? 'Crisp overcast skies' : 'Sunny with calm conditions';

  return {
    location,
    temperature: baseTemp,
    feels_like: baseTemp + (isTropical ? 3 : -2),
    condition,
    description: desc,
    humidity: isTropical ? 78 : 54,
    pressure: 1014,
    wind_speed: 14.5,
    wind_direction: 245,
    wind_gust: 22.0,
    visibility: 10.0,
    uv_index: isTropical ? 8 : 5,
    air_quality_index: 42,
    air_quality_label: 'Good',
    cloud_cover: isTropical ? 35 : 15,
    dew_point: isTropical ? 21 : 10,
    sunrise: '06:22 AM',
    sunset: '07:48 PM',
    icon: condition === 'Clear' ? 'sun' : 'cloud-sun',
    timestamp: new Date().toISOString(),
    is_day: true,
  };
}

export function getMockHourlyForecast(location: LocationInfo): HourlyForecastResponse {
  const current = getMockCurrentWeather(location);
  const now = new Date();
  const currentHour = now.getHours();

  const hourly = Array.from({ length: 24 }).map((_, i) => {
    const hour = (currentHour + i) % 24;
    const hourDate = new Date(now.getTime() + i * 3600 * 1000);
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;
    const isDay = hour >= 6 && hour <= 19;

    // Simulate diurnal temp curve
    const tempOffset = Math.sin(((hour - 8) / 24) * Math.PI * 2) * 5;
    const temp = Math.round(current.temperature + tempOffset);
    const rainChance = Math.max(5, Math.min(85, Math.round(15 + Math.sin(i * 0.5) * 30)));

    let condition = 'Clear';
    let icon = isDay ? 'sun' : 'moon';
    if (rainChance > 50) {
      condition = 'Light Rain';
      icon = 'cloud-rain';
    } else if (rainChance > 25) {
      condition = 'Partly Cloudy';
      icon = isDay ? 'cloud-sun' : 'cloud-moon';
    }

    return {
      time: hourStr,
      timestamp: hourDate.getTime(),
      temperature: temp,
      feels_like: temp + (rainChance > 40 ? -1 : 1),
      condition,
      precipitation_probability: rainChance,
      precipitation_amount: rainChance > 50 ? 1.4 : 0,
      humidity: Math.min(95, current.humidity + (rainChance > 40 ? 15 : 0)),
      wind_speed: Math.round(current.wind_speed + Math.sin(i) * 4),
      wind_direction: 240 + Math.round(Math.sin(i) * 20),
      uv_index: isDay ? Math.max(0, Math.round(current.uv_index * Math.sin(((hour - 6) / 13) * Math.PI))) : 0,
      icon,
      is_day: isDay,
    };
  });

  return {
    location,
    hourly,
  };
}

export function getMockDailyForecast(location: LocationInfo): DailyForecastResponse {
  const current = getMockCurrentWeather(location);
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const forecast = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now.getTime() + i * 86400 * 1000);
    const dayName = i === 0 ? 'Today' : dayNames[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];

    const tempDelta = Math.sin(i * 0.8) * 3;
    const high = Math.round(current.temperature + 3 + tempDelta);
    const low = Math.round(current.temperature - 5 + tempDelta);
    const rainChance = Math.round(10 + ((i * 17) % 65));

    let condition = 'Clear';
    let icon = 'sun';
    if (rainChance > 55) {
      condition = 'Showers';
      icon = 'cloud-rain';
    } else if (rainChance > 35) {
      condition = 'Partly Cloudy';
      icon = 'cloud-sun';
    } else if (i === 4) {
      condition = 'Windy';
      icon = 'wind';
    }

    return {
      date: dateStr,
      day_name: dayName,
      temperature_high: high,
      temperature_low: low,
      condition,
      description: `${condition} throughout the day with peak winds around 16 km/h.`,
      precipitation_probability: rainChance,
      precipitation_amount: rainChance > 50 ? 2.5 : 0.2,
      humidity: current.humidity + (i % 2 === 0 ? 5 : -5),
      wind_speed: current.wind_speed + (i * 1.5),
      uv_index: current.uv_index,
      sunrise: current.sunrise,
      sunset: current.sunset,
      icon,
    };
  });

  return {
    location,
    forecast,
  };
}

export function getMockWeatherAlerts(location: LocationInfo): WeatherAlertsResponse {
  // Example advisory for realistic weather systems
  return {
    location,
    alerts: [
      {
        id: 'alt-001',
        severity: 'advisory',
        title: 'Moderate UV Index Advisory',
        headline: `High Sun Exposure expected in ${location.name}`,
        description: 'UV Index will reach Level 6-8 between 11:30 AM and 3:30 PM. Sun protection recommended for outdoor activities exceeding 30 minutes.',
        instruction: 'Apply SPF 30+ sunscreen, wear protective sunglasses, and seek shade during midday peak hours.',
        effective: new Date().toISOString(),
        expires: new Date(Date.now() + 86400000).toISOString(),
        source: 'National Meteorological Center',
        urgency: 'expected',
        areas: [location.name, location.region || 'Metropolitan Area'],
      },
    ],
  };
}

export function getMockAIInsights(location: LocationInfo, current: CurrentWeatherResponse): AIInsightData {
  return {
    summary: `Conditions in ${location.name} are primarily ${current.condition.toLowerCase()} at ${current.temperature}°C. Best window for outdoor recreation is late morning before peak UV index.`,
    insights: [
      {
        category: 'outdoor',
        title: 'Optimal Outdoor Window',
        description: 'Morning (08:30 – 11:30) offers optimal thermal comfort with gentle 12 km/h breeze.',
        importance: 'high',
        iconName: 'sun',
      },
      {
        category: 'attire',
        title: 'Recommended Attire',
        description: current.temperature > 22
          ? 'Breathable light cotton layers, sunglasses, and UV protection.'
          : 'Light jacket or layer recommended for evening temperature drop.',
        importance: 'medium',
        iconName: 'shirt',
      },
      {
        category: 'rain',
        title: 'Precipitation Risk',
        description: 'Low probability (<15%) of rainfall over the next 12 hours. Umbrella not required.',
        importance: 'low',
        iconName: 'cloud-rain',
      },
      {
        category: 'health',
        title: 'Air Quality & Hydration',
        description: 'Air quality is Optimal (AQI 42). Keep well-hydrated due to moderate humidity levels.',
        importance: 'medium',
        iconName: 'heart-pulse',
      },
    ],
    generated_at: new Date().toISOString(),
  };
}
