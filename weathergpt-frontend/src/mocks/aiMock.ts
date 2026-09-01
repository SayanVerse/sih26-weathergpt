import { AIChatRequest, AIChatResponse } from '../types/ai';

export async function getMockAIChatResponse(request: AIChatRequest): Promise<AIChatResponse> {
  const query = request.message.toLowerCase();
  const locName = request.location?.name || 'your current area';

  if (query.includes('umbrella') || query.includes('rain')) {
    return {
      response: `Based on the latest forecast for **${locName}**, precipitation probability stays below 20% throughout the afternoon, with zero heavy cloud formations detected on Doppler radar. You will **not need an umbrella** today, though a light windbreaker could be comfortable if you are out late into the evening.`,
      insights: [
        'Precipitation probability: ~12%',
        'Peak cloud cover: 30% around 16:00',
        'No active severe convective warnings',
      ],
      actionable_advice: {
        umbrella_needed: false,
        attire: 'Casual lightweight clothes with optional evening layer',
        best_time_outside: 'All afternoon until sunset',
        outdoor_suitability: 'High',
      },
    };
  }

  if (query.includes('wear') || query.includes('clothes') || query.includes('outfit') || query.includes('jacket')) {
    return {
      response: `For **${locName}** today, temperatures will hover around standard seasonal averages. I recommend **breathable layers**: a comfortable t-shirt or shirt for the midday hours, accompanied by UV sunglasses, and keeping a light jacket or sweater handy if you plan to stay outdoors past 7:30 PM as ambient temperatures drop.`,
      insights: [
        'Diurnal thermal range: 8°C variation',
        'Moderate relative humidity',
        'Light winds around 14 km/h',
      ],
      actionable_advice: {
        attire: 'Breathable daytime layers + light jacket for late evening',
        outdoor_suitability: 'Very Good',
      },
    };
  }

  if (query.includes('outdoor') || query.includes('run') || query.includes('cycling') || query.includes('walk') || query.includes('exercise')) {
    return {
      response: `Today is **ideal for outdoor workouts and activities** in **${locName}**. The most pleasant window is between **08:00 AM – 11:30 AM** or **05:00 PM – 07:30 PM**, when thermal stress is low, UV exposure is moderate, and wind speeds remain mild (under 15 km/h). Air quality index is healthy (AQI < 50).`,
      insights: [
        'Air Quality Index: Good / Green',
        'Wind conditions: Calm to moderate breeze',
        'Thermal comfort index: 8.5/10',
      ],
      actionable_advice: {
        outdoor_suitability: 'Excellent',
        best_time_outside: 'Morning (8:00–11:30 AM) & Evening (5:00–7:30 PM)',
      },
    };
  }

  if (query.includes('best time') || query.includes('when')) {
    return {
      response: `The optimal time window to head outside in **${locName}** is **between 09:00 AM and 12:00 PM**. During this interval, the ambient air temperature is mild, visibility is clear (10 km+), and direct solar radiation has not yet peaked at its maximum UV index.`,
      actionable_advice: {
        best_time_outside: '09:00 AM – 12:00 PM',
        outdoor_suitability: 'Optimal',
      },
    };
  }

  // General intelligent response
  return {
    response: `Weather analysis for **${locName}**: Currently showing stable atmospheric conditions with moderate humidity and steady barometric pressure. Atmospheric stability suggests clear to partly cloudy conditions with minimal storm risk over the next 24 hours.`,
    insights: [
      'Current barometric trend: Steady (1014 hPa)',
      'Solar irradiance: Moderate',
      'Wind vector: Consistent Westerly breeze',
    ],
    actionable_advice: {
      umbrella_needed: false,
      attire: 'Comfortable daywear',
      outdoor_suitability: 'Favorable',
      best_time_outside: 'Mid-morning through late afternoon',
    },
  };
}
