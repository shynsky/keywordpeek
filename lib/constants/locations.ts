/**
 * Centralized location constants for DataForSEO Labs API
 * Location codes from: https://docs.dataforseo.com/v3/dataforseo_labs_locations_and_languages/
 */

export type LocationRegion =
  | "popular"
  | "americas"
  | "europe"
  | "asia-pacific"
  | "middle-east-africa";

export interface Location {
  code: number;
  name: string;
  languageCode: string;
  languageName: string;
  countryCode: string;
  region: LocationRegion;
}

// Default location code (United States)
export const DEFAULT_LOCATION_CODE = 2840;
export const DEFAULT_LANGUAGE_CODE = "en";

/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji
 */
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * All supported locations organized by region
 */
export const LOCATIONS: Location[] = [
  // Popular (shown first)
  { code: 2840, name: "United States", languageCode: "en", languageName: "English", countryCode: "US", region: "popular" },
  { code: 2826, name: "United Kingdom", languageCode: "en", languageName: "English", countryCode: "GB", region: "popular" },
  { code: 2124, name: "Canada", languageCode: "en", languageName: "English", countryCode: "CA", region: "popular" },
  { code: 2036, name: "Australia", languageCode: "en", languageName: "English", countryCode: "AU", region: "popular" },
  { code: 2276, name: "Germany", languageCode: "de", languageName: "German", countryCode: "DE", region: "popular" },
  { code: 2250, name: "France", languageCode: "fr", languageName: "French", countryCode: "FR", region: "popular" },
  { code: 2724, name: "Spain", languageCode: "es", languageName: "Spanish", countryCode: "ES", region: "popular" },
  { code: 2356, name: "India", languageCode: "en", languageName: "English", countryCode: "IN", region: "popular" },

  // Americas
  { code: 2032, name: "Argentina", languageCode: "es", languageName: "Spanish", countryCode: "AR", region: "americas" },
  { code: 2076, name: "Brazil", languageCode: "pt", languageName: "Portuguese", countryCode: "BR", region: "americas" },
  { code: 2152, name: "Chile", languageCode: "es", languageName: "Spanish", countryCode: "CL", region: "americas" },
  { code: 2170, name: "Colombia", languageCode: "es", languageName: "Spanish", countryCode: "CO", region: "americas" },
  { code: 2188, name: "Costa Rica", languageCode: "es", languageName: "Spanish", countryCode: "CR", region: "americas" },
  { code: 2214, name: "Dominican Republic", languageCode: "es", languageName: "Spanish", countryCode: "DO", region: "americas" },
  { code: 2218, name: "Ecuador", languageCode: "es", languageName: "Spanish", countryCode: "EC", region: "americas" },
  { code: 2222, name: "El Salvador", languageCode: "es", languageName: "Spanish", countryCode: "SV", region: "americas" },
  { code: 2320, name: "Guatemala", languageCode: "es", languageName: "Spanish", countryCode: "GT", region: "americas" },
  { code: 2340, name: "Honduras", languageCode: "es", languageName: "Spanish", countryCode: "HN", region: "americas" },
  { code: 2388, name: "Jamaica", languageCode: "en", languageName: "English", countryCode: "JM", region: "americas" },
  { code: 2484, name: "Mexico", languageCode: "es", languageName: "Spanish", countryCode: "MX", region: "americas" },
  { code: 2558, name: "Nicaragua", languageCode: "es", languageName: "Spanish", countryCode: "NI", region: "americas" },
  { code: 2591, name: "Panama", languageCode: "es", languageName: "Spanish", countryCode: "PA", region: "americas" },
  { code: 2600, name: "Paraguay", languageCode: "es", languageName: "Spanish", countryCode: "PY", region: "americas" },
  { code: 2604, name: "Peru", languageCode: "es", languageName: "Spanish", countryCode: "PE", region: "americas" },
  { code: 2630, name: "Puerto Rico", languageCode: "es", languageName: "Spanish", countryCode: "PR", region: "americas" },
  { code: 2780, name: "Trinidad and Tobago", languageCode: "en", languageName: "English", countryCode: "TT", region: "americas" },
  { code: 2858, name: "Uruguay", languageCode: "es", languageName: "Spanish", countryCode: "UY", region: "americas" },
  { code: 2862, name: "Venezuela", languageCode: "es", languageName: "Spanish", countryCode: "VE", region: "americas" },
  { code: 2068, name: "Bolivia", languageCode: "es", languageName: "Spanish", countryCode: "BO", region: "americas" },

  // Europe
  { code: 2040, name: "Austria", languageCode: "de", languageName: "German", countryCode: "AT", region: "europe" },
  { code: 2056, name: "Belgium", languageCode: "nl", languageName: "Dutch", countryCode: "BE", region: "europe" },
  { code: 2100, name: "Bulgaria", languageCode: "bg", languageName: "Bulgarian", countryCode: "BG", region: "europe" },
  { code: 2191, name: "Croatia", languageCode: "hr", languageName: "Croatian", countryCode: "HR", region: "europe" },
  { code: 2196, name: "Cyprus", languageCode: "el", languageName: "Greek", countryCode: "CY", region: "europe" },
  { code: 2203, name: "Czech Republic", languageCode: "cs", languageName: "Czech", countryCode: "CZ", region: "europe" },
  { code: 2208, name: "Denmark", languageCode: "da", languageName: "Danish", countryCode: "DK", region: "europe" },
  { code: 2233, name: "Estonia", languageCode: "et", languageName: "Estonian", countryCode: "EE", region: "europe" },
  { code: 2246, name: "Finland", languageCode: "fi", languageName: "Finnish", countryCode: "FI", region: "europe" },
  { code: 2300, name: "Greece", languageCode: "el", languageName: "Greek", countryCode: "GR", region: "europe" },
  { code: 2348, name: "Hungary", languageCode: "hu", languageName: "Hungarian", countryCode: "HU", region: "europe" },
  { code: 2352, name: "Iceland", languageCode: "is", languageName: "Icelandic", countryCode: "IS", region: "europe" },
  { code: 2372, name: "Ireland", languageCode: "en", languageName: "English", countryCode: "IE", region: "europe" },
  { code: 2380, name: "Italy", languageCode: "it", languageName: "Italian", countryCode: "IT", region: "europe" },
  { code: 2428, name: "Latvia", languageCode: "lv", languageName: "Latvian", countryCode: "LV", region: "europe" },
  { code: 2440, name: "Lithuania", languageCode: "lt", languageName: "Lithuanian", countryCode: "LT", region: "europe" },
  { code: 2442, name: "Luxembourg", languageCode: "fr", languageName: "French", countryCode: "LU", region: "europe" },
  { code: 2470, name: "Malta", languageCode: "en", languageName: "English", countryCode: "MT", region: "europe" },
  { code: 2528, name: "Netherlands", languageCode: "nl", languageName: "Dutch", countryCode: "NL", region: "europe" },
  { code: 2578, name: "Norway", languageCode: "no", languageName: "Norwegian", countryCode: "NO", region: "europe" },
  { code: 2616, name: "Poland", languageCode: "pl", languageName: "Polish", countryCode: "PL", region: "europe" },
  { code: 2620, name: "Portugal", languageCode: "pt", languageName: "Portuguese", countryCode: "PT", region: "europe" },
  { code: 2642, name: "Romania", languageCode: "ro", languageName: "Romanian", countryCode: "RO", region: "europe" },
  { code: 2688, name: "Serbia", languageCode: "sr", languageName: "Serbian", countryCode: "RS", region: "europe" },
  { code: 2703, name: "Slovakia", languageCode: "sk", languageName: "Slovak", countryCode: "SK", region: "europe" },
  { code: 2705, name: "Slovenia", languageCode: "sl", languageName: "Slovenian", countryCode: "SI", region: "europe" },
  { code: 2752, name: "Sweden", languageCode: "sv", languageName: "Swedish", countryCode: "SE", region: "europe" },
  { code: 2756, name: "Switzerland", languageCode: "de", languageName: "German", countryCode: "CH", region: "europe" },
  { code: 2804, name: "Ukraine", languageCode: "uk", languageName: "Ukrainian", countryCode: "UA", region: "europe" },
  { code: 2008, name: "Albania", languageCode: "sq", languageName: "Albanian", countryCode: "AL", region: "europe" },
  { code: 2070, name: "Bosnia and Herzegovina", languageCode: "bs", languageName: "Bosnian", countryCode: "BA", region: "europe" },
  { code: 2807, name: "North Macedonia", languageCode: "mk", languageName: "Macedonian", countryCode: "MK", region: "europe" },
  { code: 2499, name: "Montenegro", languageCode: "sr", languageName: "Serbian", countryCode: "ME", region: "europe" },

  // Asia-Pacific
  { code: 2050, name: "Bangladesh", languageCode: "bn", languageName: "Bengali", countryCode: "BD", region: "asia-pacific" },
  { code: 2344, name: "Hong Kong", languageCode: "zh", languageName: "Chinese", countryCode: "HK", region: "asia-pacific" },
  { code: 2360, name: "Indonesia", languageCode: "id", languageName: "Indonesian", countryCode: "ID", region: "asia-pacific" },
  { code: 2392, name: "Japan", languageCode: "ja", languageName: "Japanese", countryCode: "JP", region: "asia-pacific" },
  { code: 2458, name: "Malaysia", languageCode: "ms", languageName: "Malay", countryCode: "MY", region: "asia-pacific" },
  { code: 2554, name: "New Zealand", languageCode: "en", languageName: "English", countryCode: "NZ", region: "asia-pacific" },
  { code: 2586, name: "Pakistan", languageCode: "en", languageName: "English", countryCode: "PK", region: "asia-pacific" },
  { code: 2608, name: "Philippines", languageCode: "en", languageName: "English", countryCode: "PH", region: "asia-pacific" },
  { code: 2702, name: "Singapore", languageCode: "en", languageName: "English", countryCode: "SG", region: "asia-pacific" },
  { code: 2410, name: "South Korea", languageCode: "ko", languageName: "Korean", countryCode: "KR", region: "asia-pacific" },
  { code: 2144, name: "Sri Lanka", languageCode: "si", languageName: "Sinhala", countryCode: "LK", region: "asia-pacific" },
  { code: 2158, name: "Taiwan", languageCode: "zh", languageName: "Chinese", countryCode: "TW", region: "asia-pacific" },
  { code: 2764, name: "Thailand", languageCode: "th", languageName: "Thai", countryCode: "TH", region: "asia-pacific" },
  { code: 2704, name: "Vietnam", languageCode: "vi", languageName: "Vietnamese", countryCode: "VN", region: "asia-pacific" },
  { code: 2116, name: "Cambodia", languageCode: "km", languageName: "Khmer", countryCode: "KH", region: "asia-pacific" },
  { code: 2524, name: "Nepal", languageCode: "ne", languageName: "Nepali", countryCode: "NP", region: "asia-pacific" },
  { code: 2496, name: "Mongolia", languageCode: "mn", languageName: "Mongolian", countryCode: "MN", region: "asia-pacific" },

  // Middle East & Africa
  { code: 2012, name: "Algeria", languageCode: "ar", languageName: "Arabic", countryCode: "DZ", region: "middle-east-africa" },
  { code: 2818, name: "Egypt", languageCode: "ar", languageName: "Arabic", countryCode: "EG", region: "middle-east-africa" },
  { code: 2376, name: "Israel", languageCode: "he", languageName: "Hebrew", countryCode: "IL", region: "middle-east-africa" },
  { code: 2400, name: "Jordan", languageCode: "ar", languageName: "Arabic", countryCode: "JO", region: "middle-east-africa" },
  { code: 2404, name: "Kenya", languageCode: "en", languageName: "English", countryCode: "KE", region: "middle-east-africa" },
  { code: 2414, name: "Kuwait", languageCode: "ar", languageName: "Arabic", countryCode: "KW", region: "middle-east-africa" },
  { code: 2422, name: "Lebanon", languageCode: "ar", languageName: "Arabic", countryCode: "LB", region: "middle-east-africa" },
  { code: 2504, name: "Morocco", languageCode: "ar", languageName: "Arabic", countryCode: "MA", region: "middle-east-africa" },
  { code: 2566, name: "Nigeria", languageCode: "en", languageName: "English", countryCode: "NG", region: "middle-east-africa" },
  { code: 2512, name: "Oman", languageCode: "ar", languageName: "Arabic", countryCode: "OM", region: "middle-east-africa" },
  { code: 2634, name: "Qatar", languageCode: "ar", languageName: "Arabic", countryCode: "QA", region: "middle-east-africa" },
  { code: 2682, name: "Saudi Arabia", languageCode: "ar", languageName: "Arabic", countryCode: "SA", region: "middle-east-africa" },
  { code: 2710, name: "South Africa", languageCode: "en", languageName: "English", countryCode: "ZA", region: "middle-east-africa" },
  { code: 2788, name: "Tunisia", languageCode: "ar", languageName: "Arabic", countryCode: "TN", region: "middle-east-africa" },
  { code: 2792, name: "Turkey", languageCode: "tr", languageName: "Turkish", countryCode: "TR", region: "middle-east-africa" },
  { code: 2784, name: "United Arab Emirates", languageCode: "ar", languageName: "Arabic", countryCode: "AE", region: "middle-east-africa" },
  { code: 2288, name: "Ghana", languageCode: "en", languageName: "English", countryCode: "GH", region: "middle-east-africa" },
  { code: 2800, name: "Uganda", languageCode: "en", languageName: "English", countryCode: "UG", region: "middle-east-africa" },
  { code: 2834, name: "Tanzania", languageCode: "sw", languageName: "Swahili", countryCode: "TZ", region: "middle-east-africa" },
  { code: 2048, name: "Bahrain", languageCode: "ar", languageName: "Arabic", countryCode: "BH", region: "middle-east-africa" },
  { code: 2368, name: "Iraq", languageCode: "ar", languageName: "Arabic", countryCode: "IQ", region: "middle-east-africa" },
  { code: 2434, name: "Libya", languageCode: "ar", languageName: "Arabic", countryCode: "LY", region: "middle-east-africa" },
  { code: 2887, name: "Yemen", languageCode: "ar", languageName: "Arabic", countryCode: "YE", region: "middle-east-africa" },
];

/**
 * Map for O(1) lookup by location code
 */
export const LOCATIONS_BY_CODE: Map<number, Location> = new Map(
  LOCATIONS.map((loc) => [loc.code, loc])
);

/**
 * Get location by code
 */
export function getLocationByCode(code: number): Location | undefined {
  return LOCATIONS_BY_CODE.get(code);
}

/**
 * Get locations grouped by region
 */
export function getLocationsByRegion(): Record<LocationRegion, Location[]> {
  return {
    popular: LOCATIONS.filter((l) => l.region === "popular"),
    americas: LOCATIONS.filter((l) => l.region === "americas"),
    europe: LOCATIONS.filter((l) => l.region === "europe"),
    "asia-pacific": LOCATIONS.filter((l) => l.region === "asia-pacific"),
    "middle-east-africa": LOCATIONS.filter((l) => l.region === "middle-east-africa"),
  };
}

/**
 * Region display names
 */
export const REGION_LABELS: Record<LocationRegion, string> = {
  popular: "Popular",
  americas: "Americas",
  europe: "Europe",
  "asia-pacific": "Asia Pacific",
  "middle-east-africa": "Middle East & Africa",
};
