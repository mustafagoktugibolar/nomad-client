import { X } from "lucide-react";
import React from "react";
import { Combobox } from "../ui/combobox.js";
import { useFilterStore } from "../store/filterStore.js";

export type ComboboxData = {
  value: string;
  label: string;
};

const reasons: ComboboxData[] = [
  { value: "tourism", label: "Tourism" },
  { value: "business", label: "Business" },
  { value: "family", label: "Family Visit" },
  { value: "education", label: "Education" },
  { value: "work", label: "Work" },
  { value: "transit", label: "Transit" },
  { value: "health", label: "Health" },
  { value: "culture", label: "Cultural / Sport" },
  { value: "official", label: "Official" },
  { value: "settlement", label: "Settlement / Family" },
];

const TravelReasonPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { reason, setReason } = useFilterStore();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">Travel Reason</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Combobox
        datas={reasons}
        value={reason ?? ""}
        placeholder="Travel Reason"
        onChange={(val) => setReason(val)}
      />
    </>
  );
};

export default TravelReasonPopup;
