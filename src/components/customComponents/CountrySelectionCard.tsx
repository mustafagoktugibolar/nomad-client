import React, { useState } from "react";
import CountrySearchInput from "./CountrySearchInput.js";
import CountryList from "../CountryList.js";

interface Country {
  name: string;
  flag: string;
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
    <div className="pt-3 h-full border-none flex flex-col pb-[30px] bg-white rounded-lg">
      <CountrySearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CountryList countries={countries} searchTerm={searchTerm} onSelectCountry={onSelectCountry} />
    </div>
  );
};

export default CountrySelectionCard;
