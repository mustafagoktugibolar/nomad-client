import { Slider } from "../ui/slider.js";
import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

const BudgetSlider: React.FC<Props> = ({ onClose }) => {
  const [budget, setBudget] = useState([200]);

  return (
    <div className="w-80 p-4 rounded-xl bg-white dark:bg-black shadow-md border border-border">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">Bütçe</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Value bubble */}
      <div className="flex justify-center mb-1">
        <div className="bg-black text-white text-xs px-2 py-1 rounded-md relative">
          ${budget[0]}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-black" />
        </div>
      </div>

      {/* Slider */}
      <Slider
        min={100}
        max={4000}
        step={10}
        value={budget}
        onValueChange={setBudget}
      />

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>${100}</span>
        <span>${4000}</span>
      </div>

      {/* Continue button */}
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
        Devam
      </button>
    </div>
  );
};

export default BudgetSlider;
