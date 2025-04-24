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
    <div className="flex flex-col bg-gray-100 rounded-lg overflow-hidden">
      {/* Fixed Title Header */}
      <div className="flex items-center justify-between p-2 bg-gray-100">
        <div className="text-xs">Ülkeler</div>
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
                className="flex items-center w-full p-2 cursor-pointer hover:bg-gray-200 transition"
                onClick={() => onSelectCountry(country.name)}
              >
                <span className="text-2xl mr-2">{country.flag}</span>
                <span>{country.name}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default CountryList;
