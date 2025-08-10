import React, { useState } from "react";
import PassportGrid from "./customComponents/PassportGrid.js";
import { safariFetch, safariErrorHandler, safariRetry } from "../lib/safari-polyfills.js";

// Normalize API base (remove trailing slashes)
const RAW_API_BASE = '';// removed external base to use nginx proxy
const API_BASE = '';
const PASSPORT_TYPE_MAP: Record<string, string> = {
  Burgundy: 'TR-ORDINARY',
  Green: 'TR-SPECIAL',
  Grey: 'TR-SERVICE',
};

export interface Passport {
  country: string;
  image: string;
  validity: string;
}

interface PassportSelectorProps {
  selectedCountry: string;
  onBack: () => void;
  onSubmit: (passport: Passport, data: any) => void;
}

const PassportSelector: React.FC<PassportSelectorProps> = ({
  selectedCountry,
  onBack,
  onSubmit,
}) => {
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const passports: Passport[] = [
    { country: "Burgundy", image: "https://flagcdn.com/w320/tr.png", validity: "10 years" },
    { country: "Green", image: "https://flagcdn.com/w320/tr.png", validity: "5 years" },
    { country: "Grey",  image: "https://flagcdn.com/w320/tr.png", validity: "10 years" },
  ];

  const filtered = passports.filter(p => p.country === selectedCountry);

  // Helper to build URL safely whether API_BASE provided or not
  const buildUrl = (passportType: string) => {
    const qsType = encodeURIComponent(passportType);
    return `/nomad/api/v1/getMapDetail?passport_type=${qsType}`;
  };

  const handleSubmit = async () => {
    if (!selectedPassport) return;
    setError(null);
    setLoading(true);
    try {
      const apiType = PASSPORT_TYPE_MAP[selectedPassport.country] || 'TR-ORDINARY';
      const url = buildUrl(apiType);
      console.log('[PassportSelector] Fetching:', url);
      
      const data = await safariRetry(async () => {
        const res = await safariFetch(url);
        const contentType = res.headers.get('content-type') || '';
        // Read text once so we can give a better error message if JSON parse fails
        const rawText = await res.text();
        if (!contentType.includes('application/json')) {
          // Likely getting index.html (SPA) instead of API JSON -> backend not reachable / missing proxy
            throw new Error(`Unexpected response type: ${contentType || 'unknown'}; body starts with: ${rawText.slice(0,120)}`);
        }
        try {
          return JSON.parse(rawText);
        } catch (parseErr: any) {
          console.warn('Raw response that failed JSON parse:', rawText.slice(0,200));
          throw new Error(`Failed to parse JSON: ${parseErr.message}`);
        }
      }, 3, 1000);
      
      console.log("Fetched data:", data);
      onSubmit(selectedPassport, data);
    } catch (err: any) {
      safariErrorHandler(err, "PassportSelector");
      // Provide clearer user-friendly error, keep original for debugging
      if (err.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else if (/Unexpected response type/.test(err.message)) {
        setError("API unavailable: received non-JSON response. Check API_BASE or backend server.");
      } else if (/Failed to parse JSON/.test(err.message)) {
        setError("Received malformed data from server.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full pt-4 pb-20 pr-3 bg-white">
      <h5 className="font-bold text-xl mb-4 pt-4">Select passport for {selectedCountry}</h5>

      {/* any error */}
      {error && (
        <div className="text-red-600 text-sm mb-2">{error}</div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto mb-4">
        <PassportGrid
          passports={filtered.length ? filtered : passports}
          onSelect={setSelectedPassport}
          selectedPassport={selectedPassport}
        />
      </div>

      {/* Footer Buttons */}
      <div className="absolute inset-x-0 bottom-0 bg-white py-4 flex justify-between items-center z-10 pr-4">
        <button
          className="px-4 py-2 border border-gray-500 text-gray-500 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </button>

        <button
          className="px-4 py-2 border border-blue-500 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
          onClick={handleSubmit}
          disabled={!selectedPassport || loading}
        >
          {loading && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          <span>{loading ? "Loading..." : "Submit"}</span>
        </button>
      </div>
    </div>
  );
};

export default PassportSelector;
