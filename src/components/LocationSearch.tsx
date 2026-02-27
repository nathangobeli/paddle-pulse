"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { searchLocation, reverseGeocode } from '@/services/geocodingService';

export default function LocationSearch() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await searchLocation(query);
            if (result) {
                // Construct display name, prioritizing US states if available
                let displayName = result.name;
                if (result.admin1 && result.country === "United States") {
                    displayName += `, ${result.admin1}`;
                } else if (result.country) {
                    displayName += `, ${result.country}`;
                }

                router.push(`/?lat=${result.latitude}&lng=${result.longitude}&name=${encodeURIComponent(displayName)}`);
                setQuery('');
            } else {
                setError('Location not found (0 results)');
            }
        } catch (err: any) {
            console.error(err);
            setError(`Search error: ${err.message || 'Unknown network error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setIsLoading(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const name = await reverseGeocode(latitude, longitude);
                    router.push(`/?lat=${latitude}&lng=${longitude}&name=${encodeURIComponent(name)}`);
                } catch (err: any) {
                    console.error("Error reverse geocoding:", err);
                    router.push(`/?lat=${latitude}&lng=${longitude}&name=Current%20Location`);
                } finally {
                    setIsLoading(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err.code, err.message);
                let errorMsg = "Unable to retrieve your location";
                if (err.code === 1) errorMsg = "Location access denied by user";
                else if (err.code === 2) errorMsg = "Location unavailable";
                else if (err.code === 3) errorMsg = "Location request timed out";

                setError(errorMsg);
                setIsLoading(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-md relative mb-8">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search location..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-3 px-6 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#93e9be] focus:border-transparent transition-all"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#93e9be] transition-colors"
                    disabled={isLoading}
                    title="Search"
                >
                    {isLoading ? (
                        <div className="h-5 w-5 border-2 border-slate-400 border-t-[#93e9be] rounded-full animate-spin"></div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    )}
                </button>
                <div className="absolute right-10 top-1/2 -translate-y-1/2 w-px h-5 bg-slate-700"></div>
                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#38bdf8] transition-colors"
                    disabled={isLoading}
                    title="Use My Location"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <circle cx="12" cy="12" r="3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m10-10h-2M4 12H2" />
                    </svg>
                </button>
            </div>
            {error && (
                <p className="absolute -bottom-6 left-4 text-rose-400 text-sm">{error}</p>
            )}
        </form>
    );
}
