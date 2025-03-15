import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import WorldMapTooltip from "./WorldMapTooltip.js";

interface PopupInfo {
  name: string;
  lng: number;
  lat: number;
}

const MapboxWorldMap: React.FC = () => {
  // Reference to the map container div
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Reference to the Mapbox map instance
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // State for tooltip popup info
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  // State for the selected country ID
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  // State to indicate if the map has loaded
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Set the Mapbox access token from the environment variable
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!, // non-null assertion because we expect it to exist
        style: "mapbox://styles/mapbox/streets-v12?optimize=true",
        projection: "mercator",
        doubleClickZoom: false,
        testMode: true,
      });

      mapRef.current.on("load", () => {
        console.log("Map Loaded");
        setMapLoaded(true);

        setTimeout(() => {
          mapRef.current!.fitBounds(
            [
              [-160, -55],
              [160, 75],
            ],
            { padding: 10, animate: false }
          );
        });

        mapRef.current!.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        mapRef.current!.addLayer({
          id: "country-layer",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          paint: {
            "fill-color": "#627BC1",
            "fill-opacity": [
              "case",
              ["==", ["get", "iso_3166_1"], selectedCountryId],
              0.5, // Selected country opacity
              0,   // Other countries are invisible
            ],
          },
        });

        // Click event for selecting a country
        mapRef.current!.on("click", "country-layer", (e: mapboxgl.MapMouseEvent) => {
          // Check if features exist and have at least one element
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          if (!feature.properties) return;

          const countryId = feature.properties.iso_3166_1 as string;
          const countryName = feature.properties.name_en as string;

          setSelectedCountryId(countryId);

          mapRef.current!.setPaintProperty("country-layer", "fill-opacity", [
            "case",
            ["==", ["get", "iso_3166_1"], countryId],
            0.5, // Highlight selected country
            0,   // Other countries remain invisible
          ]);

          setPopupInfo({
            name: countryName,
            lng: e.originalEvent.clientX,
            lat: e.originalEvent.clientY,
          });

          // Use the native event's stopPropagation to prevent further propagation
          e.originalEvent.stopPropagation();
        });

        // Generic click event for the entire map (outside any country)
        mapRef.current!.on("click", (e: mapboxgl.MapMouseEvent) => {
          // Query features at the click point on the country-layer
          const features = mapRef.current!.queryRenderedFeatures(e.point, {
            layers: ["country-layer"],
          });
          if (features && features.length > 0) {
            // If a country feature exists at this point, do nothing.
            return;
          }
          console.log("Clicked outside any country, closing tooltip & clearing selection.");
          setPopupInfo(null);
          setSelectedCountryId(null);
          // Remove fill opacity from all countries
          mapRef.current!.setPaintProperty("country-layer", "fill-opacity", 0);
        });

        mapRef.current!.on("mouseenter", "country-layer", () => {
          mapRef.current!.getCanvas().style.cursor = "pointer";
        });

        mapRef.current!.on("mouseleave", "country-layer", () => {
          mapRef.current!.getCanvas().style.cursor = "";
        });
      });
    }
  }, [selectedCountryId]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        visibility: mapLoaded ? "visible" : "hidden",
      }}
    >
      <WorldMapTooltip popupInfo={popupInfo} />
    </div>
  );
};

export default MapboxWorldMap;
