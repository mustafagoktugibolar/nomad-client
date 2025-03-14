import React from "react";
import "../styles/StepNavigation.css";

const StepNavigation = ({ step }) => {
  return (
    <div className="d-flex align-items-center">
      {/* Step 1 */}
      <div className="d-flex align-items-center">
        <span
          className={`step-circle me-2 ${
            step === "country" ? "step-circle-active" : ""
          }`}
        >
          1
        </span>
        <span className={`step-label ${step === "country" ? "fw-normal" : "fw-lighter"} text-black`}>
          Ülke Seç
        </span>
      </div>

      {/* Arrow */}
      <span className="mx-2 step-label text-black">→</span>

      {/* Step 2 */}
      <div className="d-flex align-items-center">
        <span
          className={`step-circle me-2 ms-1 ${
            step === "passport" ? "step-circle-active" : ""
          }`}
        >
          2
        </span>
        <span className={`step-label ${step === "passport" ? "fw-normal" : "fw-lighter"} text-black`}>
          Pasaport Seç
        </span>
      </div>
    </div>
  );
};

export default StepNavigation;
