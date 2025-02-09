import { useState, useEffect } from "react";
import CountrySelectionCard from "./CountrySelectionCard";

const CountrySelector = ({ onSelectCountry }) => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data) => {
        const formattedCountries = data
          .map((country) => ({
            name: country.name.common,
            flag: country.flag,
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // Sorting alphabetically

        setCountries(formattedCountries);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  return <CountrySelectionCard countries={countries} onSelectCountry={onSelectCountry} />;
};

export default CountrySelector;
