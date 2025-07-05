import { X } from "lucide-react";
import React from "react";
import { Combobox } from "../ui/combobox.js";
import { useFilterStore } from "../store/filterStore.js";

export type ComboboxData = {
  value: string;
  label: string;
};

const reasons: ComboboxData[] = [
  { value: "tourism", label: "Turistik" },
  { value: "business", label: "Ticari" },
  { value: "family", label: "Aile Ziyareti" },
  { value: "education", label: "Eğitim" },
  { value: "work", label: "Çalışma" },
  { value: "transit", label: "Transit" },
  { value: "health", label: "Sağlık" },
  { value: "culture", label: "Kültürel – Sportif" },
  { value: "official", label: "Resmi Ziyaret" },
  { value: "settlement", label: "Yerleşim / Aile Birleşimi" },
];

const TravelReasonPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { reason, setReason } = useFilterStore();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-base font-semibold">Seyahat Nedeni</span>
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
        placeholder="Seyahat Nedeni"
        onChange={(val) => setReason(val)}
      />
    </>
  );
};

export default TravelReasonPopup;
