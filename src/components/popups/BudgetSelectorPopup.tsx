// components/BudgetSelectorPopup.tsx
import React from "react";
import { X } from "lucide-react";
import SingleValueSlider from "../customComponents/SingleValueSlider.js";
import { useFilterStore } from "../store/filterStore.js";

interface Props {
  onClose: () => void;
}

const BudgetSelectorPopup: React.FC<Props> = ({ onClose }) => {
  const { budget, setBudget } = useFilterStore();

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">Weekly Budget</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Slider */}
      <SingleValueSlider
        value={budget}
        onChange={setBudget}
        min={200}
        max={2000}
        step={10}
      />

      {/* Continue Button */}
      <button
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
        onClick={onClose}
      >
        Continue
      </button>
    </>
  );
};

export default BudgetSelectorPopup;
