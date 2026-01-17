import React, { useState } from "react";
import PassportGrid from "./customComponents/PassportGrid.js";
import { safariFetch, safariErrorHandler, safariRetry } from "../lib/safari-polyfills.js";
import { useLanguageStore } from "./store/languageStore.js";

export interface Passport {
  country: string;
  image: string;
  validity: string;
  type: string;
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
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguageStore();

  const passports: Passport[] = [
    { country: t("passport_bordo"), image: "/passports/bordo.png", validity: "10 years", type: "TR-ORDINARY" },
    { country: t("passport_yesil"), image: "/passports/yesil.png", validity: "5 years", type: "TR-SPECIAL" },
    { country: t("passport_gri"), image: "/passports/gri.png", validity: "5 years", type: "TR-SERVICE" },
    { country: t("passport_siyah"), image: "/passports/siyah.png", validity: "5 years", type: "TR-DIPLOMATIC" },
  ];

  const filtered = passports.filter(p => p.country === selectedCountry);

  const handleSubmit = async () => {
    if (!selectedPassport) return;
    setError(null);
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE || '';
      const { language } = useLanguageStore.getState();
      const url = `${apiBase}/nomad/api/v1/getMapDetail?passport_type=${selectedPassport.type}&lang=${language}`;

      // Use Safari-specific fetch with retry logic
      const data = await safariRetry(async () => {
        const res = await safariFetch(url);
        return res.json();
      }, 3, 1000);

      // pass both passport and fetched data up
      onSubmit(selectedPassport, data);
    } catch (err: any) {
      safariErrorHandler(err, "PassportSelector");
      if (err.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-full pt-4 pb-20 pr-3 bg-white">
      <h5 className="font-bold text-xl mb-4 pt-4">{t('passport_selector_title')} {selectedCountry}</h5>

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
          {t('passport_back')}
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
          <span>{loading ? t('passport_loading') : t('passport_submit')}</span>
        </button>
      </div>
    </div>
  );
};

export default PassportSelector;
