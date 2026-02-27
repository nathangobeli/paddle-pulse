import ConditionDisplay from "@/components/ConditionDisplay";
import LocationSearch from "@/components/LocationSearch";
import { fetchWeatherConditions } from "@/services/weatherService";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  // Default to New Port Richey, FL
  const lat = parseFloat(resolvedSearchParams.lat as string) || 28.24;
  const lng = parseFloat(resolvedSearchParams.lng as string) || -82.72;
  const locationName = (resolvedSearchParams.name as string) || "New Port Richey, FL";

  const weatherData = await fetchWeatherConditions(lat, lng);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 font-[family-name:var(--font-geist-sans)] selection:bg-[#93e9be]/30 selection:text-[#93e9be]">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#93e9be]/5 blur-[150px] pointer-events-none rounded-full" />

      <main className="flex flex-col gap-10 items-center w-full max-w-5xl relative z-10">

        {/* Header Section */}
        <div className="text-center w-full space-y-4 flex flex-col items-center">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tighter drop-shadow-sm">
            Paddle Pulse
          </h1>

          <LocationSearch />

          <div className="flex items-center justify-center gap-2 mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#93e9be]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-[#93e9be] font-medium tracking-wide uppercase text-sm md:text-base">
              {locationName}
            </p>
          </div>
        </div>

        {/* Dashboard Cards Container */}
        <div className="w-full">
          <ConditionDisplay
            windSpeedKmh={weatherData.windSpeed}
            windDirection={weatherData.windDirection}
            waveHeightM={weatherData.waveHeight}
            airTemperature={weatherData.airTemperature}
            weatherCode={weatherData.weatherCode}
            waterTemperature={weatherData.waterTemperature}
            sunrise={weatherData.sunrise}
            sunset={weatherData.sunset}
            tideData={weatherData.tideData}
            rainChances={weatherData.rainChances}
            uvIndex={weatherData.uvIndex}
            dailyForecasts={weatherData.dailyForecasts}
          />
        </div>

      </main>
    </div>
  );
}
