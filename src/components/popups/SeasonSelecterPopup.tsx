import { X } from "lucide-react";
import React from "react";
import { Checkbox } from "../ui/checkbox.js";
import { useFilterStore, SeasonLevel } from "../store/filterStore.js";

const seasons: SeasonLevel[] = ["Spring", "Summer", "Autumn", "Winter"];

interface Props {
  onClose: () => void;
}

const SeasonSelectorPopup: React.FC<Props> = ({ onClose }) => {
  const { season: selectedSeasons, setSeason } = useFilterStore();

  const toggle = (seasonItem: SeasonLevel) => {
    const isSelected = selectedSeasons.includes(seasonItem);
    const newSelection = isSelected
      ? selectedSeasons.filter((s) => s !== seasonItem)
      : [...selectedSeasons, seasonItem];

    setSeason(newSelection);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">Season</span>
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
              <span className="text-sm">{seasonItem}</span>
            </div>
          </label>
        ))}
      </div>
    </>
  );
};

export default SeasonSelectorPopup;
