import React, { useState } from "react";
import MapboxWorldMap from "./MapboxWorldMap.js";
import SideSelector from "./SideSelector.js";
import FilterBar from "./FilterBar.js";
import SearchBar from "./SearchBar.js";
import PassportSelector, { Passport } from "./PassportSelector.js";

const MapboxLayout: React.FC = () => {
  // Local states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [showPassportSelector, setShowPassportSelector] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);

  // Handle selected passport from the passport selector
  const handlePassportSubmit = (passport: Passport) => {
    setSelectedPassport(passport);
    setShowPassportSelector(false);
    setShowFilterBar(true);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-white">
      {/* The Map (behind everything) */}
      <MapboxWorldMap />

      {/* Search Bar at the top */}
      <div className="fixed top-5 left-5 right-5 md:left-10 md:right-auto w-full max-w-[400px] min-w-[300px] z-50">
        <SearchBar
          width="100%"
          placeholder="Nomad"
          inputGroupClass="bg-white shadow-md rounded-lg p-2"
          showMenuIcon={true}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* If we haven't shown FilterBar or PassportSelector yet, show SideSelector */}
      {!showFilterBar && !showPassportSelector && (
        <SideSelector
          isVisible={!showFilterBar && !showPassportSelector}
          onClose={() => setShowFilterBar(true)} // or something that hides the side panel
          onPassportSubmit={() => setShowPassportSelector(true)}
          searchTerm={searchTerm}
      />
      )}

      {/* Once user picks something, we can show the FilterBar */}
      {showFilterBar && (
        <div className="fixed bottom-[25px] left-1/2 transform -translate-x-1/2 w-[70%] z-40">
          <FilterBar
            onPassportClick={() => setShowPassportSelector(true)}
            selectedPassport={selectedPassport}
          />
        </div>
      )}

      {/* PassportSelector as a bottom-slide overlay */}
      <div
        className={`
          absolute inset-0 z-50 bg-white p-4
          transform transition-transform duration-500 ease-in-out
          ${showPassportSelector ? "translate-y-0" : "translate-y-full"}
        `}
      >
        {showPassportSelector && (
          <PassportSelector
            selectedCountry="Turkey"
            onBack={() => setShowPassportSelector(false)}
            onSubmit={handlePassportSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default MapboxLayout;
