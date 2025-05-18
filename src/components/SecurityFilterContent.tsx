import { useFilterStore } from "../components/store/filterStore.js";
import { Checkbox } from "../components/ui/checkbox.js";
import { X } from "lucide-react";
import React from "react";

const options = [
  "Çok Güvenli",
  "Genel Olarak Güvenli",
  "Dikkatli Olunmalı",
  "Riskli",
  "Seyahat Edilmemeli",
] as const;

type SecurityLevel = typeof options[number];

interface Props {
  onClose: () => void;
}

const SecurityFilterContent: React.FC<Props> = ({ onClose }) => {
  const { security, setSecurity } = useFilterStore();

  const toggle = (level: SecurityLevel) => {
    const isSelected = security.includes(level);
    const newSelection = isSelected
      ? security.filter((l) => l !== level)
      : [...security, level];

    setSecurity(newSelection);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">Güvenlik</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {options.map((level) => (
          <label key={level} className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Checkbox
                checked={security.includes(level)}
                onCheckedChange={() => toggle(level)}
              />
              <span className="text-sm">{level}</span>
            </div>
          </label>
        ))}
      </div>
    </>
  );
};

export default SecurityFilterContent;
