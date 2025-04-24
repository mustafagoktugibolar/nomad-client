import React, { useState } from "react";
import PassportGrid from "./PassportGrid.js";

export interface Passport {
  country: string;
  image: string;
  validity: string;
}

interface PassportSelectorProps {
  selectedCountry: string;
  onBack: () => void;
  onSubmit: (passport: Passport) => void;
}

const PassportSelector: React.FC<PassportSelectorProps> = ({
  selectedCountry,
  onBack,
  onSubmit,
}) => {
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);

  const passports: Passport[] = [
    { country: "Bordo", image: "https://flagcdn.com/w320/tr.png", validity: "10 years" },
    { country: "Yeşil", image: "https://flagcdn.com/w320/tr.png", validity: "5 years" },
    { country: "Gri", image: "https://flagcdn.com/w320/tr.png", validity: "10 years" },
  ];

  const filteredPassports = passports.filter(
    (passport) => passport.country === selectedCountry
  );

// …
return (
  <div className="relative flex flex-col h-full mt-10 pb-20">
    <h5 className="font-bold text-lg mb-3">
      {selectedCountry} için pasaport seç
    </h5>

    <PassportGrid
      passports={filteredPassports.length > 0 ? filteredPassports : passports}
      onSelect={setSelectedPassport}
      selectedPassport={selectedPassport}
    />

    {/*  
        Now absolute to the panel (parent is relative),
        spans its full width but won’t escape the panel.
    */}
    <div className="absolute inset-x-0 bottom-10 bg-auto shadow-lg pb-5 flex justify-between items-center z-10">
      <button
        className="px-4 py-2 border border-gray-500 text-gray-500 rounded-lg hover:bg-gray-100 transition"
        onClick={onBack}
      >
        Back
      </button>
      <button
        className="px-4 py-2 border border-blue-500 text-blue-500 bg-blue-100 rounded-lg hover:bg-blue-200 transition disabled:opacity-50"
        onClick={() => selectedPassport && onSubmit(selectedPassport)}
        disabled={!selectedPassport}
      >
        Submit
      </button>
    </div>
  </div>
);

};

export default PassportSelector;
