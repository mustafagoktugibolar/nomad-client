import React from "react";
import MapboxWorldMap from "./MapboxWorldMap";
import SideSelector from "./SideSelector";

const MapboxLayout: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Fullscreen Map */}
      <MapboxWorldMap />

      {/* Floating SideSelector */}
      <SideSelector />
    </div>
  );
};

export default MapboxLayout;
