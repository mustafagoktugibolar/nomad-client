import { X } from "lucide-react";
import React from "react";
import { Combobox } from "../ui/combobox.js";
import { useFilterStore } from "../store/filterStore.js";
import { useLanguageStore } from "../store/languageStore.js";

export type ComboboxData = {
  value: string;
  label: string;
};

const reasons: ComboboxData[] = [
  { value: "tourism", label: "Tourism" },
  { value: "business", label: "Business" },
  { value: "family", label: "Family Tour" },
  { value: "education", label: "Education" },
  { value: "work", label: "Work" },
  { value: "transit", label: "Transit" },
];

const TravelReasonPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { reason, setReason } = useFilterStore();
  const { t } = useLanguageStore();

  const getReasonLabel = (val: string) => {
    switch (val) {
      case "tourism": return t('reason_tourism');
      case "business": return t('reason_business');
      case "family": return t('reason_family');
      case "education": return t('reason_education');
      case "work": return t('reason_work');
      case "transit": return t('reason_transit');
      default: return val;
    }
  };

  const translatedReasons = reasons.map(r => ({
    value: r.value,
    label: getReasonLabel(r.value)
  }));

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">{t('filter_travel_reason')}</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Combobox
        datas={translatedReasons}
        value={reason ?? ""}
        placeholder={t('filter_travel_reason')}
        onChange={(val) => setReason(val)}
      />
    </>
  );
};

export default TravelReasonPopup;
