import React, { useEffect, useState } from "react";
import CountrySelectionCard from "./CountrySelectionCard.js";

interface Country {
  name: string;
  flag: string;
}

interface CountrySelectorProps {
  onSelectCountry: (country: string) => void;
  style?: React.CSSProperties;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ onSelectCountry, style }) => {
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data: any[]) => {
        const formattedCountries = data
          .map((country) => ({
            name: country.name.common,
            flag: country.flag,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  return (
    // Apply the style prop to a wrapping div so that the style is used as intended
    <div style={style}>
      <CountrySelectionCard
        countries={countries}
        onSelectCountry={onSelectCountry}
      />
    </div>
  );
};

export default CountrySelector;
