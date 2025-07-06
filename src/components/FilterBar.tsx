// FilterBar.tsx
import React, { useState } from "react";
import FilterButton from "./customComponents/FilterButton.js";
import FilterPopoverButton from "./customComponents/FilterPopoverButton.js";
import { Briefcase, CreditCard, Lock, Cloud } from "lucide-react";
import { Passport } from "./PassportSelector.js";
import SecurityFilterContent from "./popups/SecurityFilterContent.js";
import SeasonSelectorPopup from "./popups/SeasonSelectorPopup.js";
import BudgetSelectorPopup from "./popups/BudgetSelectorPopup.js";
import TravelReasonSelectorPopup from "./popups/TravelReasonPopup.js";

interface FilterBarProps {
  selectedPassport: Passport | null;     // from PassportSelector
  onPassportClick: () => void;          // triggers side panel or something else
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedPassport,
  onPassportClick,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openState, setOpenState] = useState<Record<number, boolean>>({});
  const buttons = [
    {
      type: "action",
      icon: <img src={selectedPassport?.image} className="w-5 h-5" />,
      label: selectedPassport?.country ?? "Bordo Pasaport",
      onClick: onPassportClick,
    },
    {
      type: "popover",
      icon: <Briefcase className="w-5 h-5 text-blue-600" />,
      label: "Seyahat Nedeni",
      content: <TravelReasonSelectorPopup onClose={() => setOpenState((prev) => ({ ...prev, 3: false }))} />
    },
    {
      type: "popover",
      icon: <CreditCard className="w-5 h-5 text-cyan-700" />,
      label: "Bütçe",
      content: <BudgetSelectorPopup onClose={() => setOpenState((prev) => ({ ...prev, 3: false }))} />
    },
    {
      type: "popover",
      icon: <Lock className="w-5 h-5 text-red-500" />,
      label: "Güvenlik",
      content: (
        <SecurityFilterContent onClose={() => setOpenState((prev) => ({ ...prev, 3: false }))} />
      ),
    },
    {
      type: "popover",
      icon: <Cloud className="w-5 h-5 text-gray-600" />,
      label: "Mevsimler",
      content: (
        <SeasonSelectorPopup onClose={() => setOpenState((prev) => ({ ...prev, 3: false }))} />
      ),    
    },
  ];

return (
    <div className="bg-[#F3F4F8] rounded-full shadow-md flex items-center justify-evenly min-h-[80px] px-4 z-50 w-full mb-1">
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
  );
};
export default FilterBar;
