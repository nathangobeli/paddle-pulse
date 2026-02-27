"use client";

import React, { useState, useEffect } from 'react';
import { TideDataPoint, DailyForecast } from '@/services/weatherService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

interface ConditionDisplayProps {
    windSpeedKmh: number;
    windDirection: number;
    waveHeightM: number;
    airTemperature: number;
    weatherCode: number;
    waterTemperature: number;
    sunrise: string;
    sunset: string;
    tideData: TideDataPoint[];
    rainChances?: { time: string; probability: number }[];
    uvIndex?: { time: string; index: number }[];
    dailyForecasts: DailyForecast[];
}

// Helper to format time (e.g. "2023-10-27T08:00" -> "8 AM")
const formatHour = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: 'numeric' });
};

// Helper for WMO weather codes (simplified mapping)
const getWeatherIcon = (code: number) => {
    if (code <= 1) return { icon: '☀️', desc: 'Clear' };
    if (code <= 3) return { icon: '⛅', desc: 'Partly Cloudy' };
    if (code <= 49) return { icon: '🌫️', desc: 'Fog' };
    if (code <= 69) return { icon: '🌧️', desc: 'Rain' };
    if (code <= 79) return { icon: '🌨️', desc: 'Snow' };
    if (code <= 99) return { icon: '⛈️', desc: 'Thunderstorm' };
    return { icon: '❓', desc: 'Unknown' };
};

export default function ConditionDisplay({
    windSpeedKmh,
    windDirection,
    waveHeightM,
    airTemperature,
    weatherCode,
    waterTemperature,
    sunrise,
    sunset,
    tideData,
    rainChances = [],
    uvIndex = [],
    dailyForecasts = []
}: ConditionDisplayProps) {

    const [currentTime, setCurrentTime] = useState("");
    const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
    const [selectedDay, setSelectedDay] = useState<number>(0);

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: 'numeric' }));
    }, []);

    const isToday = selectedDay === 0;
    const forecast = isToday ? null : dailyForecasts[selectedDay];

    const displayWindSpeedKmh = forecast ? forecast.maxWindSpeed : windSpeedKmh;
    const displayWaveHeightM = forecast ? forecast.maxWaveHeight : waveHeightM;
    const displayAirTemp = forecast ? forecast.airTempMax : airTemperature;
    const displayWeatherCode = forecast ? forecast.weatherCode : weatherCode;

    // Conversions
    const windMph = displayWindSpeedKmh * 0.621371;
    const waveFt = displayWaveHeightM * 3.28084;
    const airTempF = (displayAirTemp * 9 / 5) + 32;
    const waterTempF = (waterTemperature * 9 / 5) + 32;

    const thresholds = {
        Beginner: { wind: 8, wave: 1.5 },
        Intermediate: { wind: 12, wave: 3 },
        Advanced: { wind: 18, wave: 5 },
    };

    const limit = thresholds[skillLevel];
    const noGoReasons = [];
    if (windMph > limit.wind) noGoReasons.push(`Wind speed (${windMph.toFixed(1)} mph) exceeds your ${limit.wind} mph limit`);
    if (waveFt > limit.wave) noGoReasons.push(`Wave height (${waveFt.toFixed(1)} ft) exceeds your ${limit.wave} ft limit`);

    const isNoGo = noGoReasons.length > 0;
    const weather = getWeatherIcon(displayWeatherCode);

    const getWindDirectionStr = (degrees: number) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(degrees / 45) % 8];
    };

    // Wind direction arrow (rotate an up-arrow by degrees)
    const WindArrowFn = ({ deg }: { deg: number }) => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: `rotate(${deg}deg)` }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    );

    // Format day labels
    const getDayLabel = (dateStr: string, index: number) => {
        if (index === 0) return "Today";
        if (index === 1) return "Tomorrow";
        const date = new Date(dateStr);
        return date.toLocaleDateString([], { weekday: 'short' });
    };

    const startIdx = selectedDay * 24;
    const endIdx = startIdx + 24;
    const chartDayLabel = forecast ? getDayLabel(forecast.date, selectedDay) : "Today";

    // Format tide data for chart
    const chartData = tideData.slice(startIdx, endIdx).map(d => ({
        time: formatHour(d.time),
        level: Number((d.level * 3.28084).toFixed(2)) // m to ft
    }));

    const rainData = rainChances.slice(startIdx, endIdx).map(d => ({
        time: formatHour(d.time),
        probability: d.probability
    }));

    const uvData = uvIndex.slice(startIdx, endIdx).map(d => ({
        time: formatHour(d.time),
        index: d.index
    }));

    return (
        <div className="w-full space-y-8">

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                {/* Day Selection Tabs */}
                <div className="flex bg-slate-800/80 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar">
                    {dailyForecasts.slice(0, 5).map((day, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedDay(idx)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 md:flex-none ${selectedDay === idx
                                ? 'bg-[#93e9be] text-slate-950 shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {getDayLabel(day.date, idx)}
                        </button>
                    ))}
                </div>

                {/* Skill Level Toggle */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-400">Skill Level:</span>
                    <div className="flex bg-slate-800/80 p-1 rounded-xl flex-1 md:flex-none">
                        {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setSkillLevel(level)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 md:flex-none ${skillLevel === level
                                    ? 'bg-slate-700 text-[#93e9be] shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">

                {/* Weather Card */}
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#93e9be]/20 hover:border-[#93e9be]/50 transition-colors duration-300">
                    <div className="text-4xl mb-4">{weather.icon}</div>
                    <span className="text-sm uppercase tracking-widest text-[#93e9be]/70 mb-2">{weather.desc}</span>
                    <span className="text-5xl font-bold text-white tracking-tight">
                        {airTempF.toFixed(0)}° <span className="text-xl font-normal text-slate-400">F</span>
                    </span>
                </div>

                {/* Water Temp Card */}
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#93e9be]/20 hover:border-[#93e9be]/50 transition-colors duration-300">
                    <div className="text-[#93e9be] mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                    </div>
                    <span className="text-sm uppercase tracking-widest text-[#93e9be]/70 mb-2">Water Temp</span>
                    <span className="text-5xl font-bold text-white tracking-tight">
                        {waterTempF.toFixed(0)}° <span className="text-xl font-normal text-slate-400">F</span>
                    </span>
                </div>

                {/* Wind Card */}
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#93e9be]/20 hover:border-[#93e9be]/50 transition-colors duration-300">
                    <div className="text-[#93e9be] mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <span className="text-sm uppercase tracking-widest text-[#93e9be]/70 mb-2">Wind</span>
                    <span className="text-5xl font-bold text-white tracking-tight">
                        {windMph.toFixed(1)} <span className="text-xl font-normal text-slate-400">mph</span>
                    </span>
                    {isToday && (
                        <div className="mt-2 text-[#93e9be] font-bold flex items-center justify-center bg-[#93e9be]/10 px-3 py-1 rounded-full">
                            {getWindDirectionStr(windDirection)} <WindArrowFn deg={windDirection} />
                        </div>
                    )}
                </div>

                {/* Waves Card */}
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#93e9be]/20 hover:border-[#93e9be]/50 transition-colors duration-300">
                    <div className="text-[#93e9be] mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-sm uppercase tracking-widest text-[#93e9be]/70 mb-2">Waves</span>
                    <span className="text-5xl font-bold text-white tracking-tight">
                        {waveFt.toFixed(1)} <span className="text-xl font-normal text-slate-400">ft</span>
                    </span>
                </div>

            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

                {/* Tide Graph Card */}
                <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#93e9be]/20 hover:border-[#93e9be]/50 transition-colors duration-300">
                    <span className="text-sm uppercase tracking-widest text-[#93e9be]/70 w-full text-left mb-6">{chartDayLabel}'s Tide Level (ft)</span>
                    <div className="w-full h-[250px] text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#93e9be" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#93e9be" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#93e9be' }}
                                />
                                <Area type="monotone" dataKey="level" stroke="#93e9be" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                                {isToday && currentTime && <ReferenceLine x={currentTime} stroke="#f8fafc" strokeWidth={2} strokeDasharray="4 4" />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sunrise/Sunset Card */}
                <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#93e9be]/20 hover:border-[#93e9be]/50 transition-colors duration-300">
                    <div className="w-full space-y-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm uppercase tracking-widest text-[#93e9be]/80 w-full text-left">{chartDayLabel}'s Chance of Rain</span>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-bold text-white tracking-tight">
                                    {rainData[isToday ? new Date().getHours() : 12]?.probability || 0}<span className="text-slate-400 text-lg">%</span>
                                </span>
                                <div className="text-[#38bdf8]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-4m-4 2v-2m8 2v-2" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-700"></div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm uppercase tracking-widest text-orange-300/80 mb-1">Sunrise</span>
                                <span className="text-2xl font-bold text-white">{formatHour(sunrise)}</span>
                            </div>
                            <div className="text-orange-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="w-full h-px bg-slate-700"></div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm uppercase tracking-widest text-[#93e9be]/80 mb-1">Sunset</span>
                                <span className="text-2xl font-bold text-white">{formatHour(sunset)}</span>
                            </div>
                            <div className="text-[#93e9be]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rain Chances Graph */}
                <div className="md:col-span-3 flex flex-col items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#38bdf8]/20 hover:border-[#38bdf8]/50 transition-colors duration-300 mt-2">
                    <span className="text-sm uppercase tracking-widest text-[#38bdf8]/80 w-full text-left mb-6">Chance of Rain {chartDayLabel} (%)</span>
                    <div className="w-full h-[250px] text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={rainData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#38bdf8' }}
                                />
                                <Area type="monotone" dataKey="probability" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRain)" />
                                {isToday && currentTime && <ReferenceLine x={currentTime} stroke="#f8fafc" strokeWidth={2} strokeDasharray="4 4" />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* UV Index Graph */}
                <div className="md:col-span-3 flex flex-col items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#fbbf24]/20 hover:border-[#fbbf24]/50 transition-colors duration-300 mt-2">
                    <span className="text-sm uppercase tracking-widest text-[#fbbf24]/80 w-full text-left mb-6">{chartDayLabel}'s UV Index</span>
                    <div className="w-full h-[250px] text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={uvData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fbbf24' }}
                                />
                                <Area type="monotone" dataKey="index" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                                {isToday && currentTime && <ReferenceLine x={currentTime} stroke="#f8fafc" strokeWidth={2} strokeDasharray="4 4" />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Go/No-Go Badge */}
            <div className={`
        flex flex-col items-center justify-center w-full mt-4 py-6 px-8 rounded-2xl transition-all duration-500
        ${isNoGo
                    ? 'bg-rose-500/10 border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]'
                    : 'bg-[#93e9be]/10 border-2 border-[#93e9be]/50 shadow-[0_0_30px_rgba(147,233,190,0.15)] glow'}
      `}>
                {isNoGo ? (
                    <>
                        <div className="flex items-center gap-4 font-black text-2xl tracking-[0.2em] uppercase text-rose-400 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Stay Ashore
                        </div>
                        <ul className="text-rose-300/80 text-sm md:text-base font-medium text-center space-y-1">
                            {noGoReasons.map((reason, i) => (
                                <li key={i}>{reason}.</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <div className="flex items-center gap-4 font-black text-2xl tracking-[0.2em] uppercase text-[#93e9be]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Happy Paddling
                    </div>
                )}
            </div>

        </div>
    );
}
