// FilterBar.tsx
import React, { useState } from "react";
import FilterButton from "./customComponents/FilterButton.js";
import FilterPopoverButton from "./customComponents/FilterPopoverButton.js";
import { Briefcase, CreditCard, Lock, Cloud, RotateCcw } from "lucide-react";
import { Passport } from "./PassportSelector.js";
import SecurityFilterContent from "./popups/SecurityFilterContent.js";
import SeasonSelectorPopup from "./popups/SeasonSelectorPopup.js";
import BudgetSelectorPopup from "./popups/BudgetSelectorPopup.js";
import TravelReasonSelectorPopup from "./popups/TravelReasonPopup.js";
import { useFilterStore } from "./store/filterStore.js";
import { useMapDataStore } from "./store/mapDataStore.js";

interface FilterBarProps {
  selectedPassport: Passport | null;     // from PassportSelector
  onPassportClick: () => void;          // triggers side panel or something else
  onMobileToggle?: (isOpen: boolean) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedPassport,
  onPassportClick,
  onMobileToggle,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openState, setOpenState] = useState<Record<number, boolean>>({});
  // Mobile expansion state
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get filter store functions
  const {
    passport, reason, budget, security, season, resetFilters
  } = useFilterStore();

  // Get filtered countries count for reset button visibility
  const { filteredCountries, clearFilters } = useMapDataStore();

  // Check if any filters are active
  const hasActiveFilters =
    reason !== null ||
    budget !== 1200 ||
    security.length > 0 ||
    season.length > 0;

  // Handle reset filters with popover closing
  const handleResetFilters = () => {
    resetFilters();
    clearFilters();
    setOpenState({});
  };
  const buttons = [
    {
      type: "action",
      icon: <img src={selectedPassport?.image} className="w-10" />,
      label: selectedPassport?.country ?? "Burgundy Passport",
      onClick: onPassportClick,
    },
    {
      type: "popover",
      icon: <Briefcase className="w-5 h-5 text-blue-600" />,
      label: "Travel Reason",
      content: <TravelReasonSelectorPopup onClose={() => setOpenState((prev) => ({ ...prev, 1: false }))} />
    },
    {
      type: "popover",
      icon: <CreditCard className="w-5 h-5 text-cyan-700" />,
      label: "Budget",
      content: <BudgetSelectorPopup onClose={() => setOpenState((prev) => ({ ...prev, 2: false }))} />
    },
    {
      type: "popover",
      icon: <Lock className="w-5 h-5 text-red-500" />,
      label: "Security",
      content: (
        <SecurityFilterContent onClose={() => setOpenState((prev) => ({ ...prev, 3: false }))} />
      ),
    },
    {
      type: "popover",
      icon: <Cloud className="w-5 h-5 text-gray-600" />,
      label: "Seasons",
      content: (
        <SeasonSelectorPopup onClose={() => setOpenState((prev) => ({ ...prev, 4: false }))} />
      ),
    },
    // Reset button - only show when filters are active
    ...(hasActiveFilters ? [{
      type: "action" as const,
      icon: <RotateCcw className="w-5 h-5 text-red-600" />,
      label: "Reset",
      onClick: handleResetFilters,
    }] : [])
  ];

  return (
    <>
      {/* Desktop View: Horizontal Bar */}
      {!isMobile && (
        <div className="hidden md:flex bg-[#F3F4F8] rounded-full shadow-md items-center justify-evenly min-h-[80px] px-4 z-50 w-full mb-1 gap-0">
          {buttons.map((btn, index) => (
            <React.Fragment key={index}>
              {btn.type === "popover" ? (
                <FilterPopoverButton
                  icon={btn.icon}
                  label={btn.label}
                  isSelected={openState[index] === true}
                  open={openState[index] === true}
                  onOpenChange={(open) =>
                    setOpenState((prev) => ({
                      ...prev,
                      [index]: open,
                    }))
                  }
                >
                  {React.cloneElement(btn.content as React.ReactElement, {
                    onClose: () =>
                      setOpenState((prev) => ({
                        ...prev,
                        [index]: false,
                      })),
                  })}
                </FilterPopoverButton>
              ) : (
                <FilterButton
                  icon={btn.icon}
                  label={btn.label}
                  isSelected={openState[index] === true}
                  onClick={() => {
                    setSelectedIndex(index);
                    btn.onClick?.();
                  }}
                />
              )}

              {/* Separator (skip after last button) */}
              {index < buttons.length - 1 && (
                <div className="h-5 py-4 w-px bg-gray-300 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Mobile View: Expandable Upwards */}
      {isMobile && (
        <div className="md:hidden w-full flex flex-col items-center">
          {/* Expanded Content (Appears above) */}
          {isMobileExpanded && (
            <div className="absolute bottom-20 left-0 w-full px-4 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 flex flex-wrap justify-center gap-3 border border-gray-100">
                {buttons.map((btn, index) => (
                  <div key={index} className="flex justify-center w-[48%]">
                    {btn.type === "popover" ? (
                      <FilterPopoverButton
                        icon={btn.icon}
                        label={btn.label}
                        isSelected={openState[index] === true}
                        open={openState[index] === true}
                        onOpenChange={(open) =>
                          setOpenState((prev) => ({ ...prev, [index]: open }))
                        }
                      >
                        {React.cloneElement(btn.content as React.ReactElement, {
                          onClose: () => setOpenState((prev) => ({ ...prev, [index]: false })),
                        })}
                      </FilterPopoverButton>
                    ) : (
                      <FilterButton
                        icon={btn.icon}
                        label={btn.label}
                        isSelected={openState[index] === true}
                        onClick={() => {
                          setSelectedIndex(index);
                          btn.onClick?.();
                          // Close menu if it's an action (like Passport)
                          if (btn.label !== "Reset") setIsMobileExpanded(false);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Trigger Button */}
          <button
            onClick={() => {
              const newState = !isMobileExpanded;
              setIsMobileExpanded(newState);
              onMobileToggle?.(newState);
            }}
            className="bg-white text-gray-800 border border-gray-200 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium active:scale-95 transition-transform"
          >
            {isMobileExpanded ? (
              <>Close Filters</>
            ) : (
              <>
                <Briefcase className="w-4 h-4 text-blue-600" /> Filters
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
};
export default FilterBar;
