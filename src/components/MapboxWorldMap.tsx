import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import WorldMapTooltip from "./WorldMapTooltip.js";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "./ui/alert-dialog.js";
import { useMapDataStore } from "./store/mapDataStore.js";
import { useFilterStore } from "./store/filterStore.js";
import { Info, X } from "lucide-react";

export interface VisaDatum {
  target_country: string;  // ISO 3166-1 alpha-2 code
  visa_type: string;       // e.g. "visa-free", "visa-required", etc.
}

interface PopupInfo {
  name: string;
  lng: number;
  lat: number;
  isoCode?: string; // ISO 3166-1 alpha-2 code from Mapbox
}

interface MapboxWorldMapProps {
  visaData: VisaDatum[] | null;
  isSidebarOpen: boolean;
}

export interface MapboxWorldMapRef {
  flyToCountry: (isoCode: string) => void;
  fitBounds: (bounds: [number, number, number, number]) => void;
}

const MapboxWorldMap = React.forwardRef<MapboxWorldMapRef, MapboxWorldMapProps>(({ visaData, isSidebarOpen }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const lastCountryZoom = useRef<number | null>(null); // Store last double-click zoom

  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // Store hooks
  const { mapData, filteredCountries, applyFilters } = useMapDataStore();
  const filterState = useFilterStore();

  React.useImperativeHandle(ref, () => ({
    flyToCountry: (isoCode: string) => {
      // Legacy or specific ISO handling if needed
      setSelectedCountryId(isoCode);
      if (isoCode === 'TR' && mapRef.current) {
        mapRef.current.flyTo({ center: [35, 39], zoom: 4 }); // Reduced zoom
      }
    },
    fitBounds: (bounds: [number, number, number, number]) => {
      if (!mapRef.current) return;
      mapRef.current.fitBounds(
        [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
        { padding: 50, animate: true } // Padding ensures it's not too tight (solving "too zoomed")
      );
    }
  }));

  // Debug logs removed

  // Apply filters when filter state changes
  React.useEffect(() => {
    if (mapData.length > 0) {
      // Applying filters...
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
        return "#B91C1C"; // Lighter red (Tailwind red-700) - balanced
      case "visaonarrival":
      case "evisa":
      case "eta":
        return "#F59E0B"; // Darker yellow (Amber-500)
      default:
        return "#cccccc"; // Neutral color for unknown types
    }
  };

  // 1) Initialize the map & country-layer once
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      projection: "mercator" as any, // Revert to flat map
      zoom: 1.5,
      center: [20, 20],
      attributionControl: true, // Enable default attribution (bottom-right)
      doubleClickZoom: false, // Disable default zoom to allow custom reset behavior
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
          isoCode: iso, // Pass ISO code for accurate matching
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

        // Allow double-click zoom for all countries
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

  // Handle window resize with debounce to fit map
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          // Reset view to fit the world
          mapRef.current.fitBounds([[-160, -55], [160, 75]], { padding: 10, animate: true });
        }
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // 2) Whenever visaData arrives, add/replace the visa-layer
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !visaData) return;
    const map = mapRef.current;

    if (map.getLayer("visa-layer")) {
      map.removeLayer("visa-layer");
    }

    // Add dummy data for missing countries
    const missingCountries: VisaDatum[] = [
      { target_country: 'IN', visa_type: 'evisa' },
      { target_country: 'GL', visa_type: 'visa-free' },
      { target_country: 'CL', visa_type: 'visa-free' },
      { target_country: 'XK', visa_type: 'visa-free' }, // Kosovo
    ];

    // Combine API data with dummy data
    // We append missingCountries unconditionally so our priority logic can select 'evisa' over 'visa-required' if needed
    const combinedVisaData = [...visaData, ...missingCountries];

    // Deduplicate by code with priority order
    const priority = ["visa-free", "visa-free/90days", "visa-free/30days", "visa on arrival", "evisa", "eta", "visa-required"];
    const dedup = new Map<string, string>();
    combinedVisaData.forEach(d => {
      if (!d.target_country) return;
      const code = d.target_country.toUpperCase();

      // Force fix for Chile if it comes from API with bad data
      let visaType = d.visa_type;
      if (code === 'CL') {
        visaType = 'visa-free';
      }

      const current = dedup.get(code);
      if (!current) {
        dedup.set(code, visaType);
      } else {
        if (priority.indexOf(visaType) < priority.indexOf(current)) {
          dedup.set(code, visaType);
        }
      }
    });

    const matchExpr: any[] = ["match", ["get", "iso_3166_1"]];
    dedup.forEach((visa_type, code) => {
      // Skip Antarctica - it will be handled separately
      if (code !== "AQ") {
        matchExpr.push(code, getVisaColor(visa_type));
      }
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
        // Enforce India worldview to include Kashmir as part of India
        // Use 'any' to check if worldview is missing, 'all', OR contains 'IN'
        // Enforce India worldview to include Kashmir as part of India
        // Use 'any' to check if worldview is missing, 'all', OR contains 'IN'
        // Enforce India worldview to include Kashmir as part of India
        // Use 'any' to check if worldview is missing, 'all', OR contains 'IN'
        // Use unambiguous expression syntax (index-of) to avoid legacy filter confusion
        filter: [
          "any",
          ["!", ["has", "worldview"]],
          ["==", ["get", "worldview"], "all"],
          [">", ["index-of", "IN", ["coalesce", ["get", "worldview"], ""]], -1]
        ],
        paint: {
          "fill-color": matchExpr as any,
          "fill-opacity": 1,
          "fill-outline-color": "#ffffff",
        },
      },
      beforeId
    );

    // Hide ALL labels except country labels when visa layer is visible
    // Only do this when we actually have visa data to show
    const style2 = map.getStyle();
    if (style2 && style2.layers && visaData && visaData.length > 0) {
      style2.layers.forEach((layer: any) => {
        // Hide all labels except country labels
        if (layer.id && layer.type === 'symbol') {
          if (!layer.id.includes('country-label')) {
            // This will hide: cities, states, roads, POIs, etc.
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          } else {
            // For country labels, make them white (no halo as requested)
            map.setPaintProperty(layer.id, 'text-color', '#ffffff');
            map.setPaintProperty(layer.id, 'text-halo-width', 0); // Remove any halo
          }
        }
      });
    }
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
    // BUT if filters ARE active but result is empty (size 0), we MUST add layer to stripe everything
    // So we only skip if we are sure no filters are active.
    // However, filteredCountries is populated by applyFilters.
    // If applyFilters returns empty, it means everything is filtered out.
    // So we should NOT return early here.
    // The only case to return early is if we want to show "All Allowed".
    // But mapDataStore logic handles "All Allowed" by populating filteredCountries with ALL.
    // So if size is 0, it means "Nothing Allowed". So we must show stripes.
    // console.log('🎯 Adding filter layer for', filteredCountries.size, 'countries');

    // Create filter expression for countries that should NOT have the striped overlay
    // (i.e., countries that match the filter criteria)
    // Use array format for "in" expression
    const filteredCountriesArray = Array.from(filteredCountries);
    const filterExpr = ["in", ["get", "iso_3166_1"], ["literal", filteredCountriesArray]];

    // Add striped pattern for non-matching countries with improved design
    if (!map.hasImage("stripe-pattern")) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 16;
      canvas.height = 16;

      // Semi-transparent white background for softer look
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, 0, 16, 16);

      // Add refined diagonal stripes - less aggressive than before
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)'; // Darker grey stripes
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Diagonal lines from top-left to bottom-right
      for (let i = -16; i <= 32; i += 5) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 16, 16);
      }
      ctx.stroke();

      const imageData = ctx.getImageData(0, 0, 16, 16);
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
        // Only apply filter pattern to countries that HAVE an ISO code but are NOT in the filtered list
        // AND enforce India worldview (handling multi-value strings and missing properties)
        filter: [
          "all",
          ["has", "iso_3166_1"],
          // Use "!" and "in" expression to check if country is NOT in the allowed list
          // We use "literal" to pass the array of allowed ISO codes
          ["!", ["in", ["get", "iso_3166_1"], ["literal", filteredCountriesArray]]],
          [
            "any",
            ["!", ["has", "worldview"]],
            ["==", ["get", "worldview"], "all"],
            [">", ["index-of", "IN", ["coalesce", ["get", "worldview"], ""]], -1]
          ]
        ],
        paint: {
          "fill-pattern": "stripe-pattern", // Taramalı pattern kullan
          "fill-opacity": 0.8,
        },
      },
      beforeId
    );

    // Add Antarctica layer - always grey striped, never red
    if (!map.getLayer("antarctica-layer")) {
      map.addLayer(
        {
          id: "antarctica-layer",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          layout: { visibility: "visible" },
          filter: ["==", ["get", "iso_3166_1"], "AQ"], // Only Antarctica
          paint: {
            "fill-pattern": "stripe-pattern",
            "fill-opacity": 0.8,
          },
        },
        beforeId
      );
    }

    // Filter layer added
  }, [mapLoaded, filteredCountries]);


  return (
    <div
      ref={mapContainerRef}
      className={`w-screen h-screen relative ${mapLoaded ? "visible" : "invisible"
        }`}
    >
      {/* Collapsible Legend */}
      {!isSidebarOpen && (
        <div className="absolute top-20 right-5 md:top-5 md:right-5 z-10 flex flex-col items-end gap-2 text-xs">

          {/* Toggle Button */}
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {showLegend ? <X className="w-5 h-5 text-gray-600" /> : <Info className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Legend Content */}
          <div className={`
            bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 
            flex flex-col gap-2 transition-all duration-300 origin-top-right
            ${showLegend ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none hidden"}
          `}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1F9566]"></div>
              <span className="font-medium text-gray-700">Visa Free</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              <span className="font-medium text-gray-700">Visa on Arrival / E-Visa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#B91C1C]"></div>
              <span className="font-medium text-gray-700">Visa Required</span>
            </div>
          </div>
        </div>
      )}

      {popupInfo && (
        <WorldMapTooltip popupInfo={popupInfo} />
      )}
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
});

export default MapboxWorldMap;
