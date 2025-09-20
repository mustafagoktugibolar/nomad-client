import React from "react";

interface Country {
  name: string;
  flag: string;
  iso?: string; // prefer ISO for reliable SVG flags
}

interface CountryListProps {
  countries: Country[];
  searchTerm: string;
  onSelectCountry: (countryName: string) => void;
}

const CountryList: React.FC<CountryListProps> = ({ countries, searchTerm, onSelectCountry }) => {
  // Render an ISO-based flag image with emoji fallback (fixes Windows showing letters instead of emoji)
  const FlagIcon: React.FC<{ iso?: string; emoji?: string; name: string }> = ({ iso, emoji, name }) => {
    const [error, setError] = React.useState(false);
    if (!iso || error) {
      return (
        <span className="text-xl mr-3 leading-none" aria-label={`${name} flag`}>
          {emoji || "🏳️"}
        </span>
      );
    }
    const lower = iso.toLowerCase();
    const src = `https://flagcdn.com/h20/${lower}.png`;
    return (
      <img
        src={src}
        alt={`${name} flag`}
        width={20}
        height={15}
        className="mr-3 rounded-sm shadow-sm object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    );
  };

  return (
    <div className="flex flex-col bg-gray-100 rounded-lg mb-4 mt-1 overflow-hidden">
      {/* Fixed Title Header */}
      <div className="flex items-center justify-between py-2 bg-gray-100 border-b border-gray-200">
        <div className="text-xs font-medium px-2 tracking-wide text-gray-600 uppercase">Countries</div>
      </div>

      {/* Scrollable Country List */}
      <div className="flex-1 overflow-y-auto">
        <ul className="list-none p-0 m-0">
          {countries
            .filter((country) =>
              country.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((country, index) => (
              <li
                key={index}
                className="flex items-center w-full px-2 py-2 cursor-pointer hover:bg-gray-200/70 transition text-sm"
                onClick={() => onSelectCountry(country.name)}
              >
                <FlagIcon iso={country.iso} emoji={country.flag} name={country.name} />
                <span className="leading-tight">{country.name}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default CountryList;
