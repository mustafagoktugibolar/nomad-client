import React, { useState } from "react";
import PassportGrid from "./PassportGrid.js";

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
    { country: "Bordo", image: "https://flagcdn.com/w320/tr.png", validity: "10 years" },
    { country: "Yeşil", image: "https://flagcdn.com/w320/tr.png", validity: "5 years" },
    { country: "Gri",  image: "https://flagcdn.com/w320/tr.png", validity: "10 years" },
  ];

  const filtered = passports.filter(p => p.country === selectedCountry);

  const handleSubmit = async () => {
    if (!selectedPassport) return;
    setError(null);
    setLoading(true);
    try {
      const url = "/api/nomad/api/v1/getMapDetail?passport_type=TR_ORDINARY";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      console.log("Fetched data:", data);
      // pass both passport and fetched data up
      onSubmit(selectedPassport, data);
    } catch (err: any) {
      console.error(err);
      setError("Bir şeyler ters gitti. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full pt-8 pb-24 px-4 bg-white">
      <h5 className="font-bold text-lg mb-3">
        {selectedCountry} için pasaport seç
      </h5>

      {/* any error */}
      {error && (
        <div className="text-red-600 text-sm mb-2">
          {error}
        </div>
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
      <div className="absolute inset-x-0 bottom-0 border-t bg-white p-4 flex justify-between items-center z-10">
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
          <span>{loading ? "Yükleniyor..." : "Submit"}</span>
        </button>
      </div>
    </div>
  );
};

export default PassportSelector;
