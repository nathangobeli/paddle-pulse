export interface TideDataPoint {
  time: string;
  level: number;
}

export interface DailyForecast {
  date: string;
  maxWindSpeed: number;
  maxWaveHeight: number;
  weatherCode: number;
  airTempMax: number;
  airTempMin: number;
}

export interface WeatherData {
  windSpeed: number; // km/h (default from Open-Meteo)
  windDirection: number; // degrees
  waveHeight: number; // meters (default from Open-Meteo)
  airTemperature: number; // Celsius
  weatherCode: number; // WMO Weather interpretation codes
  waterTemperature: number; // Celsius
  sunrise: string; // ISO8601 string
  sunset: string; // ISO8601 string
  tideData: TideDataPoint[]; // Array of hourly tide/sea level measurements
  rainChances: { time: string; probability: number }[]; // Array of hourly precipitation probability
  uvIndex: { time: string; index: number }[]; // Array of hourly UV index
  dailyForecasts: DailyForecast[]; // Summary of the next several days
}

export const fetchWeatherConditions = async (lat: number, lng: number): Promise<WeatherData> => {
  try {
    const [forecastResponse, marineResponse] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m,temperature_2m,weather_code&hourly=precipitation_probability,uv_index&daily=sunrise,sunset,wind_speed_10m_max,weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`, { next: { revalidate: 3600 } }),
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height&hourly=sea_surface_temperature,sea_level_height_msl&daily=wave_height_max&timezone=auto&forecast_days=7`, { next: { revalidate: 3600 } })
    ]);

    if (!forecastResponse.ok || !marineResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const forecastData = await forecastResponse.json();
    const marineData = await marineResponse.json();

    // Map hourly tide data for the current day (first 24 hours of the API response)
    const tideData: TideDataPoint[] = [];
    if (marineData.hourly && marineData.hourly.time && marineData.hourly.sea_level_height_msl) {
      for (let i = 0; i < marineData.hourly.time.length; i++) {
        // Check if data is available, if not fallback to 0 or previous
        const level = marineData.hourly.sea_level_height_msl[i];
        tideData.push({
          time: marineData.hourly.time[i],
          level: typeof level === 'number' ? level : 0
        });
      }
    }

    const rainChances: { time: string, probability: number }[] = [];
    const uvIndex: { time: string, index: number }[] = [];
    if (forecastData.hourly && forecastData.hourly.time && forecastData.hourly.precipitation_probability) {
      for (let i = 0; i < forecastData.hourly.time.length; i++) {
        const prob = forecastData.hourly.precipitation_probability[i];
        rainChances.push({
          time: forecastData.hourly.time[i],
          probability: typeof prob === 'number' ? prob : 0
        });

        // UV Index is in the same hourly array
        const uv = forecastData.hourly.uv_index ? forecastData.hourly.uv_index[i] : 0;
        uvIndex.push({
          time: forecastData.hourly.time[i],
          index: typeof uv === 'number' ? uv : 0
        });
      }
    }

    const dailyForecasts: DailyForecast[] = [];
    if (forecastData.daily && forecastData.daily.time && marineData.daily && marineData.daily.time) {
      const days = Math.min(forecastData.daily.time.length, marineData.daily.time.length);
      for (let i = 0; i < days; i++) {
        dailyForecasts.push({
          date: forecastData.daily.time[i],
          maxWindSpeed: forecastData.daily.wind_speed_10m_max[i] || 0,
          maxWaveHeight: marineData.daily.wave_height_max[i] || 0,
          weatherCode: forecastData.daily.weather_code[i] || 0,
          airTempMax: forecastData.daily.temperature_2m_max[i] || 0,
          airTempMin: forecastData.daily.temperature_2m_min[i] || 0
        });
      }
    }

    // Default to the first hour's water temp if a current value is not readily available,  
    // since Open-Meteo marine hourly often corresponds to now.
    const waterTemp = marineData.hourly?.sea_surface_temperature?.[new Date().getHours()] ||
      marineData.hourly?.sea_surface_temperature?.[0] || 0;

    return {
      windSpeed: forecastData.current.wind_speed_10m,
      windDirection: forecastData.current.wind_direction_10m,
      airTemperature: forecastData.current.temperature_2m,
      weatherCode: forecastData.current.weather_code,
      sunrise: forecastData.daily?.sunrise?.[0] || "",
      sunset: forecastData.daily?.sunset?.[0] || "",

      waveHeight: marineData.current.wave_height,
      waterTemperature: waterTemp,
      tideData: tideData,
      rainChances: rainChances,
      uvIndex: uvIndex,
      dailyForecasts: dailyForecasts,
    };
  } catch (error) {
    console.error('Error fetching weather conditions:', error);
    // Return some default or throw
    throw error;
  }
};
