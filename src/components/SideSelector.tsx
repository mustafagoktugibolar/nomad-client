import React, { useState } from "react";
import CountrySelector from "./CountrySelector.js";
import PassportSelector, { Passport } from "./PassportSelector.js";
import StepNavigation from "./StepNavigation.js";

type StepType = "country" | "passport";

interface SideSelectorProps {
  onPassportSubmit: (passport: Passport) => void;
  searchTerm: string;
  isVisible: boolean;
  onClose: () => void;
}

const SideSelector: React.FC<SideSelectorProps> = ({
  onPassportSubmit,
  searchTerm,
  isVisible,
  onClose,
}) => {
  const [step, setStep] = useState<StepType>("country");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  return (
    <div
      className={`fixed top-[5.5rem] left-0 md:left-10 z-50 bg-white shadow-lg rounded-lg
                  w-full max-w-[400px] h-[calc(100vh-8rem)]
                  transition-transform duration-300 ease-in-out
                  ${isVisible ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex flex-col h-full w-full overflow-hidden p-3 pt-4">
        {/* Step Header */}
        <StepNavigation step={step} className="mb-2" />

        {/* Sliding Steps */}
        <div className="relative flex-1 overflow-hidden -mt-2">
          <div
            className={`flex w-[200%] h-full transition-transform duration-300 ease-in-out
                        ${step === "passport" ? "-translate-x-1/2" : "translate-x-0"} overflow-hidden`}
          >
            {/* Country Selection */}
            <div className="w-1/2 pr-2 overflow-hidden">
              <CountrySelector
                searchTerm={searchTerm}
                onSelectCountry={(country: string) => {
                  setSelectedCountry(country);
                  setStep("passport");
                }}
                style={{ height: "100%" }}
              />
            </div>

            {/* Passport Selection */}
            <div className="w-1/2 pl-2 overflow-hidden">
              {selectedCountry && (
                <PassportSelector
                  selectedCountry={selectedCountry}
                  onBack={() => setStep("country")}
                  onSubmit={(passport: Passport) => {
                    onPassportSubmit(passport);
                    onClose();
                    setTimeout(() => {
                      setStep("country");
                      setSelectedCountry(null);
                    }, 300);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideSelector;
