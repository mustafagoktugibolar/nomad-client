import { X } from "lucide-react";
import React from "react";
import { Checkbox } from "../ui/checkbox.js";
import { useFilterStore } from "../store/filterStore.js";
import { useLanguageStore } from "../store/languageStore.js";

const seasons = ["Spring", "Summer", "Autumn", "Winter"] as const;
type Season = typeof seasons[number];

interface Props {
  onClose: () => void;
}

const SeasonSelectorPopup: React.FC<Props> = ({ onClose }) => {
  const { season: selectedSeasons, setSeason } = useFilterStore();
  const { t } = useLanguageStore();

  const getLabel = (s: string) => {
    switch (s) {
      case "Spring": return t('season_spring');
      case "Summer": return t('season_summer');
      case "Autumn": return t('season_autumn');
      case "Winter": return t('season_winter');
      default: return s;
    }
  };

  const toggle = (seasonItem: Season) => {
    const isSelected = selectedSeasons.includes(seasonItem);
    const newSelection = isSelected
      ? selectedSeasons.filter((s) => s !== seasonItem)
      : [...selectedSeasons, seasonItem];

    setSeason(newSelection);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">{t('filter_seasons')}</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {seasons.map((seasonItem) => (
          <label key={seasonItem} className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Checkbox
                checked={selectedSeasons.includes(seasonItem)}
                onCheckedChange={() => toggle(seasonItem)}
              />
              <span className="text-sm">{getLabel(seasonItem)}</span>
            </div>
          </label>
        ))}
      </div>
    </>
  );
};

export default SeasonSelectorPopup;
