import React, { useEffect, useState } from "react";
import CountrySelectionCard from "./customComponents/CountrySelectionCard.js";
import { safariFetch, safariErrorHandler, isSafari, safariRetry, sortCountriesWithTurkeyFirst, removeDuplicateCountries } from "../lib/safari-polyfills.js";

// Fallback country data in case API fails - Turkey first, then alphabetically sorted
const FALLBACK_COUNTRIES = [
  { name: "Turkey", flag: "🇹🇷", iso: "TR" },
  { name: "Afghanistan", flag: "🇦🇫", iso: "AF" },
  { name: "Albania", flag: "🇦🇱", iso: "AL" },
  { name: "Algeria", flag: "🇩🇿", iso: "DZ" },
  { name: "Andorra", flag: "🇦🇩", iso: "AD" },
  { name: "Angola", flag: "🇦🇴", iso: "AO" },
  { name: "Antigua and Barbuda", flag: "🇦🇬", iso: "AG" },
  { name: "Argentina", flag: "🇦🇷", iso: "AR" },
  { name: "Armenia", flag: "🇦🇲", iso: "AM" },
  { name: "Australia", flag: "🇦🇺", iso: "AU" },
  { name: "Austria", flag: "🇦🇹", iso: "AT" },
  { name: "Azerbaijan", flag: "🇦🇿", iso: "AZ" },
  { name: "Bahamas", flag: "🇧🇸", iso: "BS" },
  { name: "Bahrain", flag: "🇧🇭", iso: "BH" },
  { name: "Bangladesh", flag: "🇧🇩", iso: "BD" },
  { name: "Barbados", flag: "🇧🇧", iso: "BB" },
  { name: "Belarus", flag: "🇧🇾", iso: "BY" },
  { name: "Belgium", flag: "🇧🇪", iso: "BE" },
  { name: "Belize", flag: "🇧🇿", iso: "BZ" },
  { name: "Benin", flag: "🇧🇯", iso: "BJ" },
  { name: "Bhutan", flag: "🇧🇹", iso: "BT" },
  { name: "Bolivia", flag: "🇧🇴", iso: "BO" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦", iso: "BA" },
  { name: "Botswana", flag: "🇧🇼", iso: "BW" },
  { name: "Brazil", flag: "🇧🇷", iso: "BR" },
  { name: "Brunei", flag: "🇧🇳", iso: "BN" },
  { name: "Bulgaria", flag: "🇧🇬", iso: "BG" },
  { name: "Burkina Faso", flag: "🇧🇫", iso: "BF" },
  { name: "Burundi", flag: "🇧🇮", iso: "BI" },
  { name: "Cambodia", flag: "🇰🇭", iso: "KH" },
  { name: "Cameroon", flag: "🇨🇲", iso: "CM" },
  { name: "Canada", flag: "🇨🇦", iso: "CA" },
  { name: "Cape Verde", flag: "🇨🇻", iso: "CV" },
  { name: "Central African Republic", flag: "🇨🇫", iso: "CF" },
  { name: "Chad", flag: "🇹🇩", iso: "TD" },
  { name: "Chile", flag: "🇨🇱", iso: "CL" },
  { name: "China", flag: "🇨🇳", iso: "CN" },
  { name: "Colombia", flag: "🇨🇴", iso: "CO" },
  { name: "Comoros", flag: "🇰🇲", iso: "KM" },
  { name: "Congo", flag: "🇨🇬", iso: "CG" },
  { name: "Costa Rica", flag: "🇨🇷", iso: "CR" },
  { name: "Croatia", flag: "🇭🇷", iso: "HR" },
  { name: "Cuba", flag: "🇨🇺", iso: "CU" },
  { name: "Cyprus", flag: "🇨🇾", iso: "CY" },
  { name: "Czech Republic", flag: "🇨🇿", iso: "CZ" },
  { name: "Democratic Republic of the Congo", flag: "🇨🇩", iso: "CD" },
  { name: "Denmark", flag: "🇩🇰", iso: "DK" },
  { name: "Djibouti", flag: "🇩🇯", iso: "DJ" },
  { name: "Dominica", flag: "🇩🇲", iso: "DM" },
  { name: "Dominican Republic", flag: "🇩🇴", iso: "DO" },
  { name: "East Timor", flag: "🇹🇱", iso: "TL" },
  { name: "Ecuador", flag: "🇪🇨", iso: "EC" },
  { name: "Egypt", flag: "🇪🇬", iso: "EG" },
  { name: "El Salvador", flag: "🇸🇻", iso: "SV" },
  { name: "Equatorial Guinea", flag: "🇬🇶", iso: "GQ" },
  { name: "Eritrea", flag: "🇪🇷", iso: "ER" },
  { name: "Estonia", flag: "🇪🇪", iso: "EE" },
  { name: "Eswatini", flag: "🇸🇿", iso: "SZ" },
  { name: "Ethiopia", flag: "🇪🇹", iso: "ET" },
  { name: "Fiji", flag: "🇫🇯", iso: "FJ" },
  { name: "Finland", flag: "🇫🇮", iso: "FI" },
  { name: "France", flag: "🇫🇷", iso: "FR" },
  { name: "Gabon", flag: "🇬🇦", iso: "GA" },
  { name: "Gambia", flag: "🇬🇲", iso: "GM" },
  { name: "Georgia", flag: "🇬🇪", iso: "GE" },
  { name: "Germany", flag: "🇩🇪", iso: "DE" },
  { name: "Ghana", flag: "🇬🇭", iso: "GH" },
  { name: "Greece", flag: "🇬🇷", iso: "GR" },
  { name: "Grenada", flag: "🇬🇩", iso: "GD" },
  { name: "Guatemala", flag: "🇬🇹", iso: "GT" },
  { name: "Guinea", flag: "🇬🇳", iso: "GN" },
  { name: "Guinea-Bissau", flag: "🇬🇼", iso: "GW" },
  { name: "Guyana", flag: "🇬🇾", iso: "GY" },
  { name: "Haiti", flag: "🇭🇹", iso: "HT" },
  { name: "Honduras", flag: "🇭🇳", iso: "HN" },
  { name: "Hungary", flag: "🇭🇺", iso: "HU" },
  { name: "Iceland", flag: "🇮🇸", iso: "IS" },
  { name: "India", flag: "🇮🇳", iso: "IN" },
  { name: "Indonesia", flag: "🇮🇩", iso: "ID" },
  { name: "Iran", flag: "🇮🇷", iso: "IR" },
  { name: "Iraq", flag: "🇮🇶", iso: "IQ" },
  { name: "Ireland", flag: "🇮🇪", iso: "IE" },
  { name: "Israel", flag: "🇮🇱", iso: "IL" },
  { name: "Italy", flag: "🇮🇹", iso: "IT" },
  { name: "Ivory Coast", flag: "🇨🇮", iso: "CI" },
  { name: "Jamaica", flag: "🇯🇲", iso: "JM" },
  { name: "Japan", flag: "🇯🇵", iso: "JP" },
  { name: "Jordan", flag: "🇯🇴", iso: "JO" },
  { name: "Kazakhstan", flag: "🇰🇿", iso: "KZ" },
  { name: "Kenya", flag: "🇰🇪", iso: "KE" },
  { name: "Kiribati", flag: "🇰🇮", iso: "KI" },
  { name: "Kosovo", flag: "🇽🇰", iso: "XK" },
  { name: "Kuwait", flag: "🇰🇼", iso: "KW" },
  { name: "Kyrgyzstan", flag: "🇰🇬", iso: "KG" },
  { name: "Laos", flag: "🇱🇦", iso: "LA" },
  { name: "Latvia", flag: "🇱🇻", iso: "LV" },
  { name: "Lebanon", flag: "🇱🇧", iso: "LB" },
  { name: "Lesotho", flag: "🇱🇸", iso: "LS" },
  { name: "Liberia", flag: "🇱🇷", iso: "LR" },
  { name: "Libya", flag: "🇱🇾", iso: "LY" },
  { name: "Liechtenstein", flag: "🇱🇮", iso: "LI" },
  { name: "Lithuania", flag: "🇱🇹", iso: "LT" },
  { name: "Luxembourg", flag: "🇱🇺", iso: "LU" },
  { name: "Madagascar", flag: "🇲🇬", iso: "MG" },
  { name: "Malawi", flag: "🇲🇼", iso: "MW" },
  { name: "Malaysia", flag: "🇲🇾", iso: "MY" },
  { name: "Mali", flag: "🇲🇱", iso: "ML" },
  { name: "Malta", flag: "🇲🇹", iso: "MT" },
  { name: "Marshall Islands", flag: "🇲🇭", iso: "MH" },
  { name: "Mauritania", flag: "🇲🇷", iso: "MR" },
  { name: "Mauritius", flag: "🇲🇺", iso: "MU" },
  { name: "Mexico", flag: "🇲🇽", iso: "MX" },
  { name: "Micronesia", flag: "🇫🇲", iso: "FM" },
  { name: "Moldova", flag: "🇲🇩", iso: "MD" },
  { name: "Monaco", flag: "🇲🇨", iso: "MC" },
  { name: "Mongolia", flag: "🇲🇳", iso: "MN" },
  { name: "Montenegro", flag: "🇲🇪", iso: "ME" },
  { name: "Morocco", flag: "🇲🇦", iso: "MA" },
  { name: "Mozambique", flag: "🇲🇿", iso: "MZ" },
  { name: "Myanmar", flag: "🇲🇲", iso: "MM" },
  { name: "Namibia", flag: "🇳🇦", iso: "NA" },
  { name: "Nauru", flag: "🇳🇷", iso: "NR" },
  { name: "Nepal", flag: "🇳🇵", iso: "NP" },
  { name: "Netherlands", flag: "🇳🇱", iso: "NL" },
  { name: "New Zealand", flag: "🇳🇿", iso: "NZ" },
  { name: "Nicaragua", flag: "🇳🇮", iso: "NI" },
  { name: "Niger", flag: "🇳🇪", iso: "NE" },
  { name: "Nigeria", flag: "🇳🇬", iso: "NG" },
  { name: "North Macedonia", flag: "🇲🇰", iso: "MK" },
  { name: "Norway", flag: "🇳🇴", iso: "NO" },
  { name: "Oman", flag: "🇴🇲", iso: "OM" },
  { name: "Pakistan", flag: "🇵🇰", iso: "PK" },
  { name: "Palau", flag: "🇵🇼", iso: "PW" },
  { name: "Palestine", flag: "🇵🇸", iso: "PS" },
  { name: "Panama", flag: "🇵🇦", iso: "PA" },
  { name: "Papua New Guinea", flag: "🇵🇬", iso: "PG" },
  { name: "Paraguay", flag: "🇵🇾", iso: "PY" },
  { name: "Peru", flag: "🇵🇪", iso: "PE" },
  { name: "Philippines", flag: "🇵🇭", iso: "PH" },
  { name: "Poland", flag: "🇵🇱", iso: "PL" },
  { name: "Portugal", flag: "🇵🇹", iso: "PT" },
  { name: "Qatar", flag: "🇶🇦", iso: "QA" },
  { name: "Romania", flag: "🇷🇴", iso: "RO" },
  { name: "Russia", flag: "🇷🇺", iso: "RU" },
  { name: "Rwanda", flag: "🇷🇼", iso: "RW" },
  { name: "Saint Kitts and Nevis", flag: "🇰🇳", iso: "KN" },
  { name: "Saint Lucia", flag: "🇱🇨", iso: "LC" },
  { name: "Saint Vincent and the Grenadines", flag: "🇻🇨", iso: "VC" },
  { name: "Samoa", flag: "🇼🇸", iso: "WS" },
  { name: "San Marino", flag: "🇸🇲", iso: "SM" },
  { name: "São Tomé and Príncipe", flag: "🇸🇹", iso: "ST" },
  { name: "Saudi Arabia", flag: "🇸🇦", iso: "SA" },
  { name: "Senegal", flag: "🇸🇳", iso: "SN" },
  { name: "Serbia", flag: "🇷🇸", iso: "RS" },
  { name: "Seychelles", flag: "🇸🇨", iso: "SC" },
  { name: "Sierra Leone", flag: "🇸🇱", iso: "SL" },
  { name: "Singapore", flag: "🇸🇬", iso: "SG" },
  { name: "Slovakia", flag: "🇸🇰", iso: "SK" },
  { name: "Slovenia", flag: "🇸🇮", iso: "SI" },
  { name: "Solomon Islands", flag: "🇸🇧", iso: "SB" },
  { name: "Somalia", flag: "🇸🇴", iso: "SO" },
  { name: "South Africa", flag: "🇿🇦", iso: "ZA" },
  { name: "South Korea", flag: "🇰🇷", iso: "KR" },
  { name: "South Sudan", flag: "🇸🇸", iso: "SS" },
  { name: "Spain", flag: "🇪🇸", iso: "ES" },
  { name: "Sri Lanka", flag: "🇱🇰", iso: "LK" },
  { name: "Sudan", flag: "🇸🇩", iso: "SD" },
  { name: "Suriname", flag: "🇸🇷", iso: "SR" },
  { name: "Sweden", flag: "🇸🇪", iso: "SE" },
  { name: "Switzerland", flag: "🇨🇭", iso: "CH" },
  { name: "Syria", flag: "🇸🇾", iso: "SY" },
  { name: "Tajikistan", flag: "🇹🇯", iso: "TJ" },
  { name: "Tanzania", flag: "🇹🇿", iso: "TZ" },
  { name: "Thailand", flag: "🇹🇭", iso: "TH" },
  { name: "Togo", flag: "🇹🇬", iso: "TG" },
  { name: "Tonga", flag: "🇹🇴", iso: "TO" },
  { name: "Trinidad and Tobago", flag: "🇹🇹", iso: "TT" },
  { name: "Tunisia", flag: "🇹🇳", iso: "TN" },
  { name: "Turkmenistan", flag: "🇹🇲", iso: "TM" },
  { name: "Uganda", flag: "🇺🇬", iso: "UG" },
  { name: "Ukraine", flag: "🇺🇦", iso: "UA" },
  { name: "United Arab Emirates", flag: "🇦🇪", iso: "AE" },
  { name: "United Kingdom", flag: "🇬🇧", iso: "GB" },
  { name: "United States", flag: "🇺🇸", iso: "US" },
  { name: "Uruguay", flag: "🇺🇾", iso: "UY" },
  { name: "Uzbekistan", flag: "🇺🇿", iso: "UZ" },
  { name: "Vanuatu", flag: "🇻🇺", iso: "VU" },
  { name: "Vatican City", flag: "🇻🇦", iso: "VA" },
  { name: "Venezuela", flag: "🇻🇪", iso: "VE" },
  { name: "Vietnam", flag: "🇻🇳", iso: "VN" },
  { name: "Yemen", flag: "🇾🇪", iso: "YE" },
  { name: "Zambia", flag: "🇿🇲", iso: "ZM" },
  { name: "Zimbabwe", flag: "🇿🇼", iso: "ZW" }
];

interface Country {
  name: string;
  flag: string;
  iso: string;
}

interface CountrySelectorProps {
  onSelectCountry: (country: string) => void;
  style?: React.CSSProperties;
  searchTerm?: string; // ✅ Added searchTerm for filtering
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelectCountry, style, searchTerm }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    // Check if we have cached data
    const cachedData = sessionStorage.getItem('countries-data');
    const cacheTime = sessionStorage.getItem('countries-cache-time');
    const now = Date.now();
    
    // Use cached data if it's less than 5 minutes old
    if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
      try {
        const parsedData = JSON.parse(cachedData);
        setCountries(parsedData);
        setLoading(false);
        setIsInitialLoad(false);
        return;
      } catch (e) {
        console.log('Invalid cached data, fetching fresh data...');
      }
    }
    
    // Show fallback data immediately for faster perceived loading
    setCountries(FALLBACK_COUNTRIES);
    setLoading(false);
    
    const fetchCountries = async () => {
      try {
        // Use faster fetch with specific fields to reduce data transfer
        const response = await safariFetch("https://restcountries.com/v3.1/all?fields=name,flag,cca2");
        const data: any[] = await response.json();
        
        // Format countries and remove duplicates
        const formattedCountries = data.map((country) => ({
          name: country.name.common,
          flag: country.flag || "", 
          iso: country.cca2 || "", // ISO 2-letter code from restcountries API
        }));
        
        const uniqueCountries = removeDuplicateCountries(formattedCountries);
        const sortedCountries = sortCountriesWithTurkeyFirst(uniqueCountries);
        
        // Update with real data when available
        setCountries(sortedCountries);
        setIsInitialLoad(false);
        
        // Cache the data for future use
        sessionStorage.setItem('countries-data', JSON.stringify(sortedCountries));
        sessionStorage.setItem('countries-cache-time', now.toString());
      } catch (error) {
        safariErrorHandler(error, "CountrySelector");
        console.log("Keeping fallback country data...");
        setIsInitialLoad(false);
      }
    };

    fetchCountries();
  }, []);

  // ✅ Apply search filter
  const filteredCountries = searchTerm
    ? countries.filter((country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : countries;

  if (loading && isInitialLoad) return <p className="text-center text-gray-500">Loading countries...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="w-full max-w-lg mx-auto mt-3 p-2 " style={style}>
      {isInitialLoad && (
        <div className="text-xs text-blue-500 text-center mb-2">
          Updating country list...
        </div>
      )}
      <CountrySelectionCard countries={filteredCountries} onSelectCountry={onSelectCountry} />
    </div>
  );
};

export default CountrySelector;
