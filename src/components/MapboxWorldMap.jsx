import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import WorldMapTooltip from "./WorldMapTooltip"; 

const MapboxWorldMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false); 

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12?optimize=true",
        projection: "mercator",
        doubleClickZoom: false,
        testMode: true,
      });

      mapRef.current.on("load", () => {
        console.log("Map Loaded");
        setMapLoaded(true);

        setTimeout(() => {
          mapRef.current.fitBounds(
            [
              [-160, -55], 
              [160, 75],
            ],
            { padding: 10, animate: false }
          );
        });

        mapRef.current.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        mapRef.current.addLayer({
          id: "country-layer",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          paint: {
            "fill-color": "#627BC1",
            "fill-opacity": [
              "case",
              ["==", ["get", "iso_3166_1"], selectedCountryId],
              0.5,
              0,
            ],
          },
        });

        mapRef.current.on("click", "country-layer", (e) => {
          const countryId = e.features[0].properties.iso_3166_1;
          const countryName = e.features[0].properties.name_en;

          setSelectedCountryId(countryId);

          mapRef.current.setPaintProperty("country-layer", "fill-opacity", [
            "case",
            ["==", ["get", "iso_3166_1"], countryId],
            0.5,
            0,
          ]);

          setPopupInfo({
            name: countryName,
            lng: e.originalEvent.clientX,
            lat: e.originalEvent.clientY,
          });
        });

        mapRef.current.on("mouseenter", "country-layer", () => {
          mapRef.current.getCanvas().style.cursor = "pointer";
        });

        mapRef.current.on("mouseleave", "country-layer", () => {
          mapRef.current.getCanvas().style.cursor = "";
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
      {/* Use the Tooltip component */}
      <WorldMapTooltip popupInfo={popupInfo} />
    </div>
  );
};

export default MapboxWorldMap;
