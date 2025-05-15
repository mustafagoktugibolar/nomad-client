import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import WorldMapTooltip from "./WorldMapTooltip.js";

export interface VisaDatum {
  target_country: string;  // ISO 3166-1 alpha-2 code
  visa_type: string;       // e.g. "visa-free", "visa-required", etc.
}

interface PopupInfo {
  name: string;
  lng: number;
  lat: number;
}

interface MapboxWorldMapProps {
  visaData: VisaDatum[] | null;
}

const MapboxWorldMap: React.FC<MapboxWorldMapProps> = ({ visaData }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Map visa_type → fill color
  const getVisaColor = (type: string) => {
    switch (type) {
      case "visa-free":
      case "visa-free\/30days":
      case "visa-free\/90days":
        return "#1F9566";
      case "visa required":
        return "#F01C31";
      case "visa on arrival":
      case "eVisa":
      case "eTA":
        return "#FFD964";
      default:
        return "#1F9566";
    }
  };

  // 1) Initialize the map & country-layer once
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12?optimize=true",
      projection: "mercator",
      doubleClickZoom: false,
    });

    map.on("load", () => {
      setMapLoaded(true);

      // fit world
      map.fitBounds([[-160, -55], [160, 75]], { padding: 10, animate: false });

      // vector source of country boundaries
      map.addSource("countries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      // base fill for selection highlight
      map.addLayer({
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

      // click handler to highlight + tooltip
      map.on("click", "country-layer", (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties as any;
        const iso = props.iso_3166_1 as string;
        const name = props.name_en as string;

        setSelectedCountryId(iso);
        map.setPaintProperty("country-layer", "fill-opacity", [
          "case",
          ["==", ["get", "iso_3166_1"], iso],
          0.5,
          0,
        ]);

        setPopupInfo({
          name,
          lng: e.originalEvent.clientX,
          lat: e.originalEvent.clientY,
        });

        e.originalEvent.stopPropagation();
      });

      // click outside clears selection
      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["country-layer"],
        });
        if (!features.length) {
          setPopupInfo(null);
          setSelectedCountryId(null);
          map.setPaintProperty("country-layer", "fill-opacity", 0);
        }
      });

      map.on("mouseenter", "country-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "country-layer", () => {
        map.getCanvas().style.cursor = "";
      });

      mapRef.current = map;
    });
  }, [selectedCountryId]);

  // 2) Whenever visaData arrives, add/replace the visa-layer
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !visaData) return;
    const map = mapRef.current;
  
    // Remove old layer if present
    if (map.getLayer("visa-layer")) {
      map.removeLayer("visa-layer");
    }
  
    // 1) Filter & normalize data
    const goodEntries = visaData
      .filter(d => typeof d.target_country === "string" && !!d.target_country)
      .map(d => ({
        code: d.target_country.toUpperCase(),
        color: getVisaColor(d.visa_type),
      }));
  
    // 2) Build the match expression
    const matchExpr: any[] = ["match", ["get", "iso_3166_1"]];
    goodEntries.forEach(({ code, color }) => {
      matchExpr.push(code, color);
    });
    matchExpr.push("rgba(0,0,0,0)"); // fallback
  
    // 3) Add your layer
    map.addLayer(
      {
        id: "visa-layer",
        type: "fill",
        source: "countries",
        "source-layer": "country_boundaries",
        paint: {
          // cast to any so TS stops complaining
          "fill-color": (matchExpr as any),
          "fill-opacity": 0.6,
        },
      },
      "country-layer" // insert above
    );
  }, [mapLoaded, visaData]);
  

  return (
    <div
      ref={mapContainerRef}
      className={`w-screen h-screen relative ${
        mapLoaded ? "visible" : "invisible"
      }`}
    >
      <WorldMapTooltip popupInfo={popupInfo} />
    </div>
  );
};

export default MapboxWorldMap;
