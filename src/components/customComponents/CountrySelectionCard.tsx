import React, { useState } from "react";
import CountrySearchInput from "./CountrySearchInput.js";
import CountryList from "../CountryList.js";

interface Country {
  name: string;
  flag: string;
  iso?: string;
}

interface CountrySelectionCardProps {
  countries: Country[];
  onSelectCountry: (countryName: string) => void;
}

const CountrySelectionCard: React.FC<CountrySelectionCardProps> = ({
  countries,
  onSelectCountry,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <div className="h-full flex flex-col bg-white rounded-lg">
      <CountrySearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CountryList countries={countries} searchTerm={searchTerm} onSelectCountry={onSelectCountry} />
    </div>
  );
};

export default CountrySelectionCard;
