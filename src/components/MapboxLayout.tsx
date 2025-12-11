import React, { useState, useEffect, useRef } from "react";
import type { MapboxWorldMapRef, VisaDatum } from "./MapboxWorldMap.js";
import SideSelector from "./SideSelector.js";
import FilterBar from "./FilterBar.js";
import SearchBar from "./customComponents/SearchBar.js";
import { Passport } from "./PassportSelector.js";
import { useFilterStore } from "./store/filterStore.js";
import { useMapDataStore } from "./store/mapDataStore.js";

const MapboxWorldMap = React.lazy(() => import("./MapboxWorldMap.js"));

const MapboxLayout: React.FC = () => {
  const mapRef = useRef<MapboxWorldMapRef>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);
  const [showSideSelector, setShowSideSelector] = useState(true);
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Now accepts both the passport and the fetched visaData
  const [visaData, setVisaData] = useState<VisaDatum[] | null>(null);

  // Get filter store values
  const { passport, reason, budget, security, season } = useFilterStore();
  const { applyFilters } = useMapDataStore();

  // Side Selector controlled state
  const [sideStep, setSideStep] = useState<"country" | "passport">("country");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

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

  const handleSearchSubmit = async () => {
    if (!searchTerm) return;
    const term = searchTerm.toLowerCase().trim();
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(term)}.json?types=country&access_token=${token}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        if (feature.bbox) {
          // [minX, minY, maxX, maxY]
          mapRef.current?.fitBounds(feature.bbox as [number, number, number, number]);
        }
      } else {
        console.log("Country not found:", term);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleMenuClick = () => {
    if (showSideSelector) {
      setShowSideSelector(false);
      // If we have a passport selected, show the filter bar again
      if (selectedPassport) {
        setTimeout(() => setShowFilterBar(true), 300);
      }
    } else {
      setShowSideSelector(true);
      setShowFilterBar(false);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-white">
      <React.Suspense fallback={
        <div className="w-screen h-screen bg-[#A9D5E8] flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="font-medium text-lg tracking-wide">Loading World Map...</span>
        </div>
      }>
        <MapboxWorldMap ref={mapRef} visaData={visaData} isSidebarOpen={showSideSelector} />
      </React.Suspense>

      {/* 2. Search at top - Mobile optimized */}
      <div className="fixed top-2 left-2 right-2 md:top-5 md:left-10 md:w-full md:max-w-[400px] z-50">
        <SearchBar
          width="100%"
          placeholder="Nomad"
          inputGroupClass="bg-white shadow-md rounded-lg p-2"
          showMenuIcon
          onMenuClick={handleMenuClick}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>

      {/* 3. SideSelector panel */}
      <SideSelector
        isVisible={showSideSelector}
        onPassportSubmit={handlePassportSubmit}
        onClose={() => {
          setShowSideSelector(false);
          setTimeout(() => setShowFilterBar(true), 300);
        }}
        // Controlled props
        step={sideStep}
        setStep={setSideStep}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
      />

      {/* 4. FilterBar after initial pick */}
      {showFilterBar && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] md:w-[70%] z-40">
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
