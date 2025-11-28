import React, { useState, useEffect } from "react";
import MapboxWorldMap, { VisaDatum } from "./MapboxWorldMap.js";
import SideSelector from "./SideSelector.js";
import FilterBar from "./FilterBar.js";
import SearchBar from "./customComponents/SearchBar.js";
import { Passport } from "./PassportSelector.js";
import { useFilterStore } from "./store/filterStore.js";
import { useMapDataStore } from "./store/mapDataStore.js";

const MapboxLayout: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);
  const [showSideSelector, setShowSideSelector] = useState(true);
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Now accepts both the passport and the fetched visaData
  const [visaData, setVisaData] = useState<VisaDatum[] | null>(null);

  // Get filter store values
  const { passport, reason, budget, security, season } = useFilterStore();
  const { applyFilters } = useMapDataStore();

  // Apply filters whenever any filter changes
  useEffect(() => {
    applyFilters({
      passport,
      reason,
      budget,
      security,
      season
    });
  }, [passport, reason, budget, security, season, applyFilters]);

  const handlePassportSubmit = (passport: Passport, data: VisaDatum[]) => {
    setSelectedPassport(passport);
    setVisaData(data);

    // slide panel out
    setShowSideSelector(false);
    // after the animation, show the FilterBar
    setTimeout(() => setShowFilterBar(true), 300);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-white">
      {/* 1. Map background */}
      {/* 1. Map background */}
      <MapboxWorldMap visaData={visaData} isSidebarOpen={showSideSelector} />

      {/* 2. Search at top */}
      <div className="fixed top-5 left-5 right-5 md:left-10 max-w-[400px] w-full z-50">
        <SearchBar
          width="100%"
          placeholder="Nomad"
          inputGroupClass="bg-white shadow-md rounded-lg p-2"
          showMenuIcon
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {/* 3. SideSelector panel */}
      <SideSelector
        isVisible={showSideSelector}
        searchTerm={searchTerm}
        onPassportSubmit={handlePassportSubmit}
        onClose={() => {
          setShowSideSelector(false);
          setTimeout(() => setShowFilterBar(true), 300);
        }}
      />

      {/* 4. FilterBar after initial pick */}
      {showFilterBar && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[70%] z-40">
          <FilterBar
            selectedPassport={selectedPassport}
            onPassportClick={() => {
              setShowFilterBar(false);
              setShowSideSelector(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MapboxLayout;
