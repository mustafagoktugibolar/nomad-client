import React, { useEffect, useState } from "react";
import CountrySelectionCard from "./CountrySelectionCard.js";

interface Country {
  name: string;
  flag: string;
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

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then((response) => response.json())
      .then((data: any[]) => {
        const formattedCountries = data
          .map((country) => ({
            name: country.name.common,
            flag: country.flag || "", 
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
        setError("Failed to load countries.");
        setLoading(false);
      });
  }, []);

  // ✅ Apply search filter
  const filteredCountries = searchTerm
    ? countries.filter((country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : countries;

  if (loading) return <p className="text-center text-gray-500">Loading countries...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="w-full max-w-lg mx-auto mt-3 p-2" style={style}>
      <CountrySelectionCard countries={filteredCountries} onSelectCountry={onSelectCountry} />
    </div>
  );
};

export default CountrySelector;
