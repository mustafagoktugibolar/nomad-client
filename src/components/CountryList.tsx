import React from "react";

interface Country {
  name: string;
  flag: string;
}

interface CountryListProps {
  countries: Country[];
  searchTerm: string;
  onSelectCountry: (countryName: string) => void;
}

const CountryList: React.FC<CountryListProps> = ({ countries, searchTerm, onSelectCountry }) => {
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
                <span className="text-xl mr-3 leading-none">{country.flag}</span>
                <span className="leading-tight">{country.name}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default CountryList;
