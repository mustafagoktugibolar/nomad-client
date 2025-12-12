import { useFilterStore } from "../store/filterStore.js";
import { Checkbox } from "../ui/checkbox.js";
import { X } from "lucide-react";
import React from "react";
import { useLanguageStore } from "../store/languageStore.js";

const options = [
  "Very Safe",
  "Generally Safe",
  "Use Caution",
  "Risky",
  "Do Not Travel",
] as const;

type SecurityLevel = typeof options[number];

interface Props {
  onClose: () => void;
}

const SecurityFilterContent: React.FC<Props> = ({ onClose }) => {
  const { security, setSecurity } = useFilterStore();
  const { t } = useLanguageStore();

  const getLabel = (level: string) => {
    switch (level) {
      case "Very Safe": return t('option_very_safe');
      case "Generally Safe": return t('option_generally_safe');
      case "Use Caution": return t('option_use_caution');
      case "Risky": return t('option_risky');
      case "Do Not Travel": return t('option_do_not_travel');
      default: return level;
    }
  };

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
        <span className="text-base font-semibold">{t('filter_security')}</span>
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
              <span className="text-sm">{getLabel(level)}</span>
            </div>
          </label>
        ))}
      </div>
    </>
  );
};

export default SecurityFilterContent;
