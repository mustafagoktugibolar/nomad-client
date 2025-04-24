// FilterBar.tsx
import React, { useState } from "react";
import FilterButton from "./FilterButton.js";
import FilterPopoverButton from "./FilterPopoverButton.js";
import { Briefcase, CreditCard, Lock, Cloud } from "lucide-react";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import { Passport } from "./PassportSelector.js";

interface FilterBarProps {
  selectedPassport: Passport | null;     // from PassportSelector
  onPassportClick: () => void;          // triggers side panel or something else
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedPassport,
  onPassportClick,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const buttons = [
    {
      type: "action",
      icon: <img src="/passport.png" className="w-5 h-5" />,
      label: selectedPassport?.country ?? "Bordo Pasaport",
      onClick: onPassportClick,
    },
    {
      type: "popover",
      icon: <Briefcase className="w-5 h-5 text-blue-600" />,
      label: "Seyahat Nedeni",
      content: (
        <div>
          <Label>Seyahat Nedeni</Label>
          <Input placeholder="İş, Tatil..." />
        </div>
      ),
    },
    {
      type: "popover",
      icon: <CreditCard className="w-5 h-5 text-cyan-700" />,
      label: "Bütçe",
      content: <Input placeholder="₺0 - ₺10000" />,
    },
    {
      type: "popover",
      icon: <Lock className="w-5 h-5 text-red-500" />,
      label: "Güvenlik",
      content: <p>Güvenlik tercihleri</p>,
    },
    {
      type: "popover",
      icon: <Cloud className="w-5 h-5 text-gray-600" />,
      label: "Mevsimler",
      content: <p>Mevsim tercihleri</p>,
    },
  ];

  return (
    <div className="bg-[#F3F4F8] rounded-full shadow-md flex items-center justify-evenly min-h-[80px] px-4 z-50 w-full">
      {buttons.map((btn, index) =>
        btn.type === "popover" ? (
          <FilterPopoverButton
            key={index}
            icon={btn.icon}
            label={btn.label}
            isSelected={selectedIndex === index}
            onOpenChange={(open) => setSelectedIndex(open ? index : null)}
          >
            {btn.content}
          </FilterPopoverButton>
        ) : (
          <FilterButton
            key={index}
            icon={btn.icon}
            label={btn.label}
            isSelected={selectedIndex === index}
            onClick={() => {
              setSelectedIndex(index);
              btn.onClick?.();
            }}
          />
        )
      )}
    </div>
  );
};

export default FilterBar;
