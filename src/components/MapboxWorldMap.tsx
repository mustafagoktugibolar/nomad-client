import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import WorldMapTooltip from "./WorldMapTooltip.js";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "./ui/alert-dialog.js";
import { useMapDataStore } from "./store/mapDataStore.js";
import { useFilterStore } from "./store/filterStore.js";
import { useLanguageStore } from "./store/languageStore.js"; // Import language store
import { Info, X, Globe } from "lucide-react";

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
  closeTooltip: () => void;
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
  const [isDefaultView, setIsDefaultView] = useState(true);

  // Store hooks
  const { mapData, filteredCountries, applyFilters } = useMapDataStore();
  const filterState = useFilterStore();
  const { t, language, setLanguage } = useLanguageStore(); // Use language hook

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
    },
    closeTooltip: () => {
      setPopupInfo(null);
      setSelectedCountryId(null);
      if (mapRef.current && mapRef.current.getLayer("country-layer")) {
        mapRef.current.setPaintProperty("country-layer", "fill-opacity", 0);
      }
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

    mapRef.current = map;

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
            ["==", ["get", "iso_3166_1"], selectedCountryId || ""], // Use explicit string for match
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
        // Note: Using State in Paint Property here might be stale if effect doesn't re-run, 
        // but we update paint property dynamically below, so it's fine.

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

      map.on('moveend', () => {
        const zoom = map.getZoom();
        // Show reset button if zoomed in significantly (zoom > 2.5) or moved far
        // Simple heuristic: just check zoom for now as most interactions involve zooming
        setIsDefaultView(zoom < 2.5);
      });

      // mapRef.current = map; // MOVED UP
    });

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Remove selectedCountryId dependency

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

    // Add dummy data for missing countries (Same logic as before)
    const missingCountries: VisaDatum[] = [
      { target_country: 'IN', visa_type: 'evisa' },
      { target_country: 'GL', visa_type: 'visa-free' },
      { target_country: 'CL', visa_type: 'visa-free' },
      { target_country: 'XK', visa_type: 'visa-free' },
    ];

    const combinedVisaData = [...visaData, ...missingCountries];
    const priority = ["visa-free", "visa-free/90days", "visa-free/30days", "visa on arrival", "evisa", "eta", "visa-required"];
    const dedup = new Map<string, string>();
    combinedVisaData.forEach(d => {
      if (!d.target_country) return;
      const code = d.target_country.toUpperCase();
      let visaType = d.visa_type;
      if (code === 'CL') visaType = 'visa-free';

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
      if (code !== "AQ") matchExpr.push(code, getVisaColor(visa_type));
    });
    matchExpr.push("#cccccc");

    // OPTIMIZATION: If layer exists, update paint property only
    if (map.getLayer("visa-layer")) {
      map.setPaintProperty("visa-layer", "fill-color", matchExpr as any);
      // Also ensure it is visible
      map.setLayoutProperty("visa-layer", "visibility", "visible");
    } else {
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
    }

    // Hide labels logic (lighter update)
    const style2 = map.getStyle();
    if (style2 && style2.layers && visaData && visaData.length > 0) {
      style2.layers.forEach((layer: any) => {
        if (layer.id && layer.type === 'symbol') {
          if (!layer.id.includes('country-label')) {
            if (map.getLayoutProperty(layer.id, 'visibility') !== 'none') {
              map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
          } else {
            // Only update if different to avoid overhead? Mapbox handles this check, but we can be safe.
            map.setPaintProperty(layer.id, 'text-color', '#ffffff');
            map.setPaintProperty(layer.id, 'text-halo-width', 0);
          }
        }
      });
    }
  }, [mapLoaded, visaData]);

  // Filter Layer - Apply striped overlay to non-matching countries
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const filteredCountriesArray = Array.from(filteredCountries);

    // Create filter expression
    const filterExpr = [
      "all",
      ["has", "iso_3166_1"],
      ["!", ["in", ["get", "iso_3166_1"], ["literal", filteredCountriesArray]]],
      [
        "any",
        ["!", ["has", "worldview"]],
        ["==", ["get", "worldview"], "all"],
        [">", ["index-of", "IN", ["coalesce", ["get", "worldview"], ""]], -1]
      ]
    ];

    // OPTIMIZATION: If layer exists, just update the filter
    if (map.getLayer("filter-layer")) {
      map.setFilter("filter-layer", filterExpr as any);
      // Ensure visibility
      map.setLayoutProperty("filter-layer", "visibility", "visible");
    } else {
      // Only create texture if needed
      if (!map.hasImage("stripe-pattern")) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 16;
        canvas.height = 16;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, 16, 16);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = -16; i <= 32; i += 5) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 16, 16);
        }
        ctx.stroke();
        const imageData = ctx.getImageData(0, 0, 16, 16);
        map.addImage('stripe-pattern', imageData);
      }

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
          filter: filterExpr as any,
          paint: {
            "fill-pattern": "stripe-pattern",
            "fill-opacity": 0.8,
          },
        },
        beforeId
      );
    }

    // Antarctica layer (static, so minimal check)
    if (!map.getLayer("antarctica-layer")) {
      // ... (Keep existing checks for adding unique singleton layers)
      const style = map.getStyle();
      const labelLayer = style && style.layers ? style.layers.find((l: any) => l.id.includes("country-label")) : undefined;
      const beforeId = labelLayer?.id;
      map.addLayer({
        id: "antarctica-layer",
        type: "fill",
        source: "countries",
        "source-layer": "country_boundaries",
        layout: { visibility: "visible" },
        filter: ["==", ["get", "iso_3166_1"], "AQ"],
        paint: { "fill-pattern": "stripe-pattern", "fill-opacity": 0.8 },
      }, beforeId);
    }

  }, [mapLoaded, filteredCountries]);


  // Helper for dynamic passport label in settings
  const getSettingsPassportLabel = (p: string | null) => {
    if (!p) return t('passport_default');
    if (p.includes("Bordo") || p.includes("Ordinary")) return t('passport_bordo');
    if (p.includes("Yeşil") || p.includes("Special")) return t('passport_yesil');
    if (p.includes("Gri") || p.includes("Service")) return t('passport_gri');
    if (p.includes("Siyah") || p.includes("Diplomatic")) return t('passport_siyah');
    return p;
  };

  return (
    <div
      ref={mapContainerRef}
      className={`w-screen h-screen relative ${mapLoaded ? "visible" : "invisible"
        }`}
    >
      {/* Collapsible Legend */}
      <div className="absolute top-20 right-5 md:top-5 md:right-5 z-10 flex flex-col items-end gap-2 text-xs">

        {/* Info Menu Trigger */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Info className="w-5 h-5 text-gray-600" />
        </button>

        {/* Reset View Button */}
        {!isDefaultView && (
          <button
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.fitBounds([[-160, -55], [160, 75]], { padding: 10, animate: true });
                // Reset Visibility if it was hidden by deep zoom
                if (mapRef.current.getLayer("visa-layer")) mapRef.current.setLayoutProperty("visa-layer", "visibility", "visible");
                if (mapRef.current.getLayer("country-layer")) mapRef.current.setLayoutProperty("country-layer", "visibility", "visible");
              }
              setSelectedCountryId(null);
              setPopupInfo(null);
            }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors animate-in fade-in zoom-in-50"
            title="Reset to World View"
          >
            <Globe className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Info Menu Content */}
        {showLegend && (
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 flex flex-col gap-3 transition-all duration-300 origin-top-right min-w-[200px] animate-in fade-in zoom-in-95">
            {/* Header with Close */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-1">
              <span className="font-semibold text-gray-800 text-sm">{t('settings_title')}</span>
              <button
                onClick={() => setShowLegend(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Settings Items */}
            <div className="flex flex-col gap-3 mb-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings_language')}</span>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                  className="flex items-center justify-between w-full p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors text-left group"
                >
                  <span className="text-sm font-medium text-gray-700">{language === 'en' ? 'English' : 'Türkçe'}</span>
                  <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{t('settings_change')}</span>
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings_passport')}</span>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                  <span className="text-xs font-medium text-blue-700">{getSettingsPassportLabel(filterState.passport)}</span>
                </div>
              </div>
            </div>

            {/* Mobile Legend (Hidden on Desktop) */}
            <div className="md:hidden flex flex-col gap-2 pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t('settings_map_legend')}</span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1F9566]"></div>
                  <span className="text-sm text-gray-700">{t('legend_visa_free')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                  <span className="text-sm text-gray-700">{t('legend_visa_on_arrival')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]"></div>
                  <span className="text-sm text-gray-700">{t('legend_visa_required')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Permanent Legend Bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200/50 flex items-center gap-3 text-[11px] whitespace-nowrap hidden md:flex">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1F9566]"></div>
          <span className="font-medium text-gray-700">{t('legend_visa_free')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
          <span className="font-medium text-gray-700">{t('legend_visa_on_arrival')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]"></div>
          <span className="font-medium text-gray-700">{t('legend_visa_required')}</span>
        </div>
      </div>

      {
        popupInfo && (
          <WorldMapTooltip popupInfo={popupInfo} onClose={() => setPopupInfo(null)} />
        )
      }
      {
        showComingSoon && (
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
        )
      }
    </div >
  );
});

export default MapboxWorldMap;
