import React, { useState } from "react";
import CountrySelector from "./CountrySelector.js";
import PassportSelector, { Passport } from "./PassportSelector.js";
import StepNavigation from "./StepNavigation.js";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "./ui/alert-dialog.js";
import { useLanguageStore } from "./store/languageStore.js";

type StepType = "country" | "passport";

// 🚨 Update this interface so onPassportSubmit takes two args
// 🚨 Update this interface so onPassportSubmit takes two args
interface SideSelectorProps {
  onPassportSubmit: (passport: Passport, data: any[]) => void;
  isVisible: boolean;
  onClose: () => void;
  // Controlled props
  step: StepType;
  setStep: (step: StepType) => void;
  selectedCountry: string | null;
  setSelectedCountry: (country: string | null) => void;
}

const SideSelector: React.FC<SideSelectorProps> = ({
  onPassportSubmit,
  isVisible,
  onClose,
  step,
  setStep,
  selectedCountry,
  setSelectedCountry,
}) => {
  // Removed internal state for step and selectedCountry
  const [showComingSoon, setShowComingSoon] = useState(false);
  const { t } = useLanguageStore();

  return (
    <div
      className={`
               fixed z-50 bg-white shadow-lg rounded-2xl md:rounded-lg
               
               /* Mobile: Bottom Sheet (floating) */
               bottom-4 w-[95%] h-[85vh] left-1/2 -translate-x-1/2 rounded-2xl
               transform transition-all duration-300 ease-in-out
               ${isVisible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-100"}

               /* Desktop: Side Panel */
               md:top-[5.5rem] md:left-0 md:w-[400px] md:max-w-[400px] md:h-[calc(100vh-8rem)] md:translate-y-0
               
               /* Desktop visibility logic with explicit prefixes for JIT detection */
               ${isVisible
          ? "md:translate-x-0 md:ml-10 md:opacity-100"
          : "md:-translate-x-[120%] md:ml-0 md:opacity-0 md:pointer-events-none"}
             `}
    >
      <div className="flex flex-col h-full overflow-hidden p-3 pt-4">
        <StepNavigation step={step} className="mb-2 px-3" />

        <div className="relative flex-1 overflow-hidden -mt-2">
          <div
            className={`
                     flex w-[200%] h-full transition-transform duration-300 ease-in-out
                     ${step === "passport" ? "-translate-x-1/2" : "translate-x-0"}
                   `}
          >
            {/* Country */}
            <div className="w-1/2 pr-2 ml-2 mr-2 overflow-hidden">
              <CountrySelector
                onSelectCountry={(c) => {
                  if (c !== "Turkey") { // Only allow Turkey for now
                    setShowComingSoon(true);
                    return;
                  }
                  setSelectedCountry(c);
                  setStep("passport");
                }}
                style={{ height: "100%" }}
              />
            </div>

            {/* Passport */}
            <div className="w-1/2 pl-2 overflow-hidden">
              {selectedCountry && (
                // PassportSelector now calls onSubmit(passport, data)
                <PassportSelector
                  selectedCountry={selectedCountry}
                  onBack={() => setStep("country")}
                  onSubmit={(passport, data) => {
                    onPassportSubmit(passport, data);
                    // onClose() is redundant as MapboxLayout handles side selector visibility

                    // reset for next time
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
      {showComingSoon && (
        <AlertDialog open={showComingSoon} onOpenChange={(o) => setShowComingSoon(o)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('coming_soon_title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('coming_soon_desc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowComingSoon(false)}>{t('coming_soon_ok')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default SideSelector;
