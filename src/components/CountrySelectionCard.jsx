import { useState } from "react";
import { Card } from "react-bootstrap";
import CountrySearchInput from "./CountrySearchInput";
import CountryList from "./CountryList";

const CountrySelectionCard = ({ countries, onSelectCountry }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Card className="p-3 h-100">
      <CountrySearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <CountryList countries={countries} searchTerm={searchTerm} onSelectCountry={onSelectCountry} />
    </Card>
  );
};

export default CountrySelectionCard;
