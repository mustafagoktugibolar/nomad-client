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
  const lastCountryZoom = useRef<number | null>(null); // Store last double-click zoom

  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Map visa_type → fill color
  const getVisaColor = (type: string) => {
    // Normalize the visa_type string
    const t = (type || "").toLowerCase().replace(/\s+/g, "").trim();
    switch (t) {
      case "visa-free":
      case "visa-free/30days":
      case "visa-free/90days":
        return "#1F9566";
      case "visarequired":
        return "#F01C31";
      case "visaonarrival":
      case "evisa":
      case "eta":
        return "#FFD964";
      default:
        return "#cccccc"; // Neutral color for unknown types
    }
  };

  // 1) Initialize the map & country-layer once
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      projection: "mercator",
      doubleClickZoom: false,
      accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string,
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

      // Double-click handler to zoom to country and hide visa layer
      map.on("dblclick", "country-layer", (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        const props: any = feature.properties;
        const iso = props.iso_3166_1 as string;
        const bounds = new mapboxgl.LngLatBounds();

        function addCoords(coords: any) {
          if (typeof coords[0] === 'number') {
            bounds.extend(coords as [number, number]);
          } else {
            coords.forEach(addCoords);
          }
        }
        addCoords((feature as any).geometry.coordinates);

        map.fitBounds(bounds, { padding: { top: 40, right: 40, left: 40, bottom: 120 }, animate: true });

        map.once('moveend', () => {
          lastCountryZoom.current = map.getZoom();
        });

        if (map.getLayer("visa-layer")) {
          map.setLayoutProperty("visa-layer", "visibility", "none");
        }
        if (map.getLayer("country-layer")) {
          map.setLayoutProperty("country-layer", "visibility", "none");
        }
        setPopupInfo(null);
        setSelectedCountryId(null);
        map.setPaintProperty("country-layer", "fill-opacity", 0);
      });

      // Double-click handler for non-country areas: reset to start position
      map.on("dblclick", (e) => {
        // Only trigger if not on a country feature
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["country-layer"],
        });
        if (!features.length) {
          // Reset to initial bounds
          map.fitBounds([[-160, -55], [160, 75]], { padding: 10, animate: true });
          // Optionally, restore layers if hidden
          if (map.getLayer("visa-layer")) {
            map.setLayoutProperty("visa-layer", "visibility", "visible");
          }
          if (map.getLayer("country-layer")) {
            map.setLayoutProperty("country-layer", "visibility", "visible");
          }
          setSelectedCountryId(null);
          setPopupInfo(null);
          lastCountryZoom.current = null;
        }
      });

      // Restore layers on zoom out (based on lastCountryZoom)
      map.on("zoomend", () => {
        if (lastCountryZoom.current !== null) {
          const threshold = lastCountryZoom.current * 0.75;
          if (map.getZoom() <= threshold) {
            if (map.getLayer("visa-layer")) {
              map.setLayoutProperty("visa-layer", "visibility", "visible");
            }
            if (map.getLayer("country-layer")) {
              map.setLayoutProperty("country-layer", "visibility", "visible");
            }
            lastCountryZoom.current = null; // Reset so it only triggers once
          }
        }
      });

      mapRef.current = map;
    });
  }, [selectedCountryId]);

  // 2) Whenever visaData arrives, add/replace the visa-layer
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !visaData) return;
    const map = mapRef.current;

    if (map.getLayer("visa-layer")) {
      map.removeLayer("visa-layer");
    }

    // Deduplicate by code with priority order
    const priority = ["visa-free", "visa-free/90days", "visa-free/30days", "visa on arrival", "evisa", "eta", "visa-required"];
    const dedup = new Map<string, string>();
    visaData.forEach(d => {
      if (!d.target_country) return;
      const code = d.target_country.toUpperCase();
      const current = dedup.get(code);
      if (!current) {
        dedup.set(code, d.visa_type);
      } else {
        if (priority.indexOf(d.visa_type) < priority.indexOf(current)) {
          dedup.set(code, d.visa_type);
        }
      }
    });

    const matchExpr: any[] = ["match", ["get", "iso_3166_1"]];
    dedup.forEach((visa_type, code) => {
      matchExpr.push(code, getVisaColor(visa_type));
    });
    matchExpr.push("#cccccc");

    const style = map.getStyle();
    const labelLayer = style && style.layers ? style.layers.find(l => l.id.includes("country-label")) : undefined;
    const beforeId = labelLayer?.id;

    map.addLayer(
      {
        id: "visa-layer",
        type: "fill",
        source: "countries",
        "source-layer": "country_boundaries",
        layout: { visibility: "visible" },
        paint: {
          "fill-color": matchExpr as any,
          "fill-opacity": 1,
          "fill-outline-color": "#ffffff",
        },
      },
      beforeId
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
