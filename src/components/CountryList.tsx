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
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        maxHeight: "calc(100% - 30px)",
        backgroundColor: "#F8F9FB",
      }}
    >
      <ul className="list-unstyled">
        {countries
          .filter((country) =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((country, index) => (
            <li
              key={index}
              className="d-flex align-items-center p-2"
              style={{ cursor: "pointer" }}
              onClick={() => onSelectCountry(country.name)}
            >
              <span className="fs-4 me-2">{country.flag}</span>
              <span>{country.name}</span>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CountryList;
