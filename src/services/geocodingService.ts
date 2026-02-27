export interface GeocodingResult {
    latitude: number;
    longitude: number;
    name: string;
    admin1?: string; // State/Province
    country: string;
}

export const searchLocation = async (query: string): Promise<GeocodingResult | null> => {
    try {
        const fetchLocation = async (searchQuery: string) => {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`);
            if (!response.ok) {
                throw new Error('Failed to fetch location data');
            }
            return response.json();
        };

        let data = await fetchLocation(query);

        // Try fallbacks if no results
        if (!data.results || data.results.length === 0) {
            if (query.includes(',')) {
                // Fallback for "City, State"
                const cityOnly = query.split(',')[0].trim();
                data = await fetchLocation(cityOnly);
            } else {
                // Fallback for "City ST" (e.g., "Miami FL")
                const parts = query.trim().split(/\s+/);
                if (parts.length > 1 && parts[parts.length - 1].length === 2) {
                    const cityOnly = parts.slice(0, -1).join(' ');
                    data = await fetchLocation(cityOnly);
                }
            }
        }

        if (!data.results || data.results.length === 0) {
            return null;
        }

        const result = data.results[0];
        return {
            latitude: result.latitude,
            longitude: result.longitude,
            name: result.name,
            admin1: result.admin1,
            country: result.country
        };
    } catch (error) {
        console.error('Error in searchLocation:', error);
        throw error;
    }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        if (!response.ok) {
            throw new Error('Failed to reverse geocode');
        }
        const data = await response.json();

        // Try to construct a good display name
        let name = data.city || data.locality || "Current Location";
        if (data.principalSubdivision && data.countryCode === "US") {
            name += `, ${data.principalSubdivision}`;
        } else if (data.countryName && name !== "Current Location") {
            name += `, ${data.countryName}`;
        }

        return name;
    } catch (error) {
        console.error('Error in reverseGeocode:', error);
        return "Current Location"; // Fallback name
    }
};
