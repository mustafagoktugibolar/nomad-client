import * as React from "react";
import SearchBar from "./SearchBar.js";

interface CountrySearchInputProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const CountrySearchInput: React.FC<CountrySearchInputProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="pt-4 pl-1 pb-2">{/* adjusted spacing */}
      <h5 className="font-bold text-xl leading-tight mb-3 tracking-tight">Which country's passport do you have?</h5>
      <SearchBar
        width="100%"
        inputGroupClass="border rounded-lg text-sm h-11 my-0"
        showMenuIcon={false}
        searchValue={searchTerm}
        placeholder="Search or select a country"
        onSearchChange={setSearchTerm}
      />
    </div>
  );
};

export default CountrySearchInput;
