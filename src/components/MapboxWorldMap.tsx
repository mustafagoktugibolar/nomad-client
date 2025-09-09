import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import WorldMapTooltip from "./WorldMapTooltip.js";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "./ui/alert-dialog.js";
import { useMapDataStore } from "./store/mapDataStore.js";
import { useFilterStore } from "./store/filterStore.js";

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
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Store hooks
  const { mapData, filteredCountries, applyFilters } = useMapDataStore();
  const filterState = useFilterStore();

  // Debug: Log data structure
  React.useEffect(() => {
    console.log('🔧 Filter state:', filterState);
    console.log('🎯 Filtered countries:', filteredCountries.size, Array.from(filteredCountries));
    
    if (mapData.length > 0) {
      console.log('🔍 Map Data Sample:', mapData.slice(0, 2));
      console.log('🗝️ Available keys:', Object.keys(mapData[0] || {}));
      
      // Log detailed info about first few countries to find valid data
      console.log('🏠 First 3 countries details:');
      for (let i = 0; i < Math.min(3, mapData.length); i++) {
        const country = mapData[i]; 
        console.log(`  Country ${i}:`, {
          target_country: country.target_country,
          target_country_name: country.target_country_name,
          security_level: country.security_level,
          security_level_name: country.security_level_name,
          visa_type: country.visa_type,
          passport_type_name: country.passport_type_name
        });
      }
      
      console.log('📊 Total Countries:', mapData.length);
    }
  }, [mapData, filteredCountries, filterState]);

  // Apply filters when filter state changes
  React.useEffect(() => {
    if (mapData.length > 0) {
      console.log('🔄 Applying filters...');
      applyFilters({
        passport: filterState.passport,
        reason: filterState.reason,
        budget: filterState.budget,
        security: filterState.security,
        season: filterState.season,
      });
    }
  }, [filterState.passport, filterState.reason, filterState.budget, filterState.security, filterState.season, mapData.length, applyFilters]);

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
        if (iso !== "TR") { // only Turkey supported
          setShowComingSoon(true);
          return;
        }
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

  // Filter Layer - Apply striped overlay to non-matching countries
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    // Remove existing filter layer if exists
    if (map.getLayer("filter-layer")) {
      map.removeLayer("filter-layer");
    }

    // If no filters are active, don't add filter layer
    if (filteredCountries.size === 0) {
      console.log('🚫 No filters active, skipping filter layer');
      return;
    }

    console.log('🎯 Adding filter layer for', filteredCountries.size, 'countries');

    // Create filter expression for countries that should NOT have the striped overlay
    // (i.e., countries that match the filter criteria)
    // Use array format for "in" expression
    const filteredCountriesArray = Array.from(filteredCountries);
    const filterExpr = ["in", ["get", "iso_3166_1"], ["literal", filteredCountriesArray]];

    // Add striped pattern for non-matching countries
    if (!map.hasImage("stripe-pattern")) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 20;
      canvas.height = 20;
      
      // Transparent background
      ctx.clearRect(0, 0, 20, 20);
      
      // Add bright yellow diagonal stripes - highly visible on all colors
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)'; // Bright yellow
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Diagonal lines from top-left to bottom-right
      for (let i = -20; i <= 40; i += 6) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 20, 20);
      }
      ctx.stroke();
      
      // Add black outline to yellow stripes for even more contrast
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -20; i <= 40; i += 6) {
        ctx.moveTo(i - 1, 0);
        ctx.lineTo(i + 19, 20);
        ctx.moveTo(i + 1, 0);
        ctx.lineTo(i + 21, 20);
      }
      ctx.stroke();
      
      const imageData = ctx.getImageData(0, 0, 20, 20);
      map.addImage('stripe-pattern', imageData);
    }

    // Add the filter layer with striped overlay for non-matching countries
    const style = map.getStyle();
    const labelLayer = style && style.layers ? style.layers.find((l: any) => l.id.includes("country-label")) : undefined;
    const beforeId = labelLayer?.id;

    map.addLayer(
      {
        id: "filter-layer",
        type: "fill",
        source: "countries",
        "source-layer": "country_boundaries",
        layout: { visibility: "visible" },
        filter: ["!", filterExpr], // NOT in filtered countries - güvenli olmayanlar çizgili olur
        paint: {
          "fill-pattern": "stripe-pattern",
          "fill-opacity": 0.9,
        },
      },
      beforeId
    );

    console.log('✅ Filter layer added successfully');
  }, [mapLoaded, filteredCountries]);


  return (
    <div
      ref={mapContainerRef}
      className={`w-screen h-screen relative ${
        mapLoaded ? "visible" : "invisible"
      }`}
    >
      <WorldMapTooltip popupInfo={popupInfo} />
      {showComingSoon && (
        <AlertDialog open={showComingSoon} onOpenChange={setShowComingSoon}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Coming Soon</AlertDialogTitle>
              <AlertDialogDescription>
                Data for this country is not available yet. We are working to add more countries soon.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowComingSoon(false)}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default MapboxWorldMap;
