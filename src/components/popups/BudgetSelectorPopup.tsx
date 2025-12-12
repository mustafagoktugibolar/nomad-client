// components/BudgetSelectorPopup.tsx
import React from "react";
import { X } from "lucide-react";
import SingleValueSlider from "../customComponents/SingleValueSlider.js";
import { useFilterStore } from "../store/filterStore.js";
import { useLanguageStore } from "../store/languageStore.js";

interface Props {
  onClose: () => void;
}

const BudgetSelectorPopup: React.FC<Props> = ({ onClose }) => {
  const { budget, setBudget } = useFilterStore();
  const { t } = useLanguageStore();
  const [localBudget, setLocalBudget] = React.useState(budget);

  // Sync local state with store when store updates (e.g. reset button)
  React.useEffect(() => {
    setLocalBudget(budget);
  }, [budget]);

  // Discrete budget snap points as requested
  const budgetSnapPoints = [100, 200, 400, 600, 800, 1000, 1200];

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">{t('filter_budget_title')}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Slider */}
      <SingleValueSlider
        value={localBudget}
        onChange={setLocalBudget}
        onCommit={setBudget}
        min={100}
        max={1200}
        step={1}
        snapPoints={budgetSnapPoints}
      />
    </>
  );
};

export default BudgetSelectorPopup;
