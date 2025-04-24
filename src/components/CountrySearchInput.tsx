import * as React from "react";
import SearchBar from "./SearchBar.js";

interface CountrySearchInputProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const CountrySearchInput: React.FC<CountrySearchInputProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="py-2">
      <h5 className="font-bold text-lg  mb-1">Hangi ülkenin pasaportuna sahipsin?</h5>
      <SearchBar
        width="100%"
        inputGroupClass="border-1 rounded-lg text-sm h-12 my-2"
        showMenuIcon={false}
        searchValue={searchTerm}
        placeholder="Ülke ara veya seç"
        onSearchChange={setSearchTerm}
      />
    </div>
  );
};

export default CountrySearchInput;
