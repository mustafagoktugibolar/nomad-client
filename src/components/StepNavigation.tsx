import React from "react";
import { useLanguageStore } from "./store/languageStore.js";

type StepType = "country" | "passport";

interface StepNavigationProps {
  step: StepType;
  className?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ step, className }) => {
  const { t } = useLanguageStore();
  return (
    <div className={`flex items-center justify-start ${className}`}>
      {/* Step 1 */}
      <div className="flex items-center">
        <span
          className={`w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 text-[0.7rem] font-semibold mr-2 
            ${step === "country"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-100 text-gray-500 border-gray-400"}`}
        >
          1
        </span>
        <span className={`text-[0.65rem] ${step === "country" ? "text-black font-medium" : "text-gray-400"}`}>
          {t('step_select_country')}
        </span>
      </div>

      {/* Arrow */}
      <span className="mx-3 text-[0.7rem] text-gray-500">→</span>

      {/* Step 2 */}
      <div className="flex items-center">
        <span
          className={`w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 text-[0.7rem] font-semibold mr-2 
            ${step === "passport"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-100 text-gray-500 border-gray-400"}`}
        >
          2
        </span>
        <span className={`text-[0.65rem] ${step === "passport" ? "text-black font-medium" : "text-gray-400"}`}>
          {t('step_select_passport')}
        </span>
      </div>
    </div>
  );
};

export default StepNavigation;
