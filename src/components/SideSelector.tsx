import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import CountrySelector from "./CountrySelector";
import PassportSelector from "./PassportSelector";
import SearchBar from "./SearchBar";
import StepNavigation from "./StepNavigation";

type StepType = "country" | "passport";

const SideSelector: React.FC = () => {
  const [step, setStep] = useState<StepType>("country");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  return (
    <div
      className="d-flex flex-column align-items-start"
      style={{
        position: "absolute",
        top: "20px",
        left: "2%",
        width: "400px",
      }}
    >
      {/* ✅ Search Bar */}
      <SearchBar width="100%" inputGroupClass="bg-success" showMenuIcon={true} />

      {/* ✅ SideSelector - Adjusted Height to `100vh - 100px` */}
      <Card
        className="shadow-lg p-3 rounded border-0 mt-3 w-100"
        style={{
          height: "calc(100vh - 120px)",
          overflowY: "auto",
        }}
      >
        <Card.Body className="d-flex flex-column">
          <StepNavigation step={step} />

          {/* ✅ Step 1: Country Selection */}
          {step === "country" && (
            <CountrySelector
              style={{
                height: "calc(100vh - 120px)",
                overflowY: "auto",
              }}
              onSelectCountry={(country: string) => {
                setSelectedCountry(country);
                setStep("passport");
              }}
            />
          )}

          {/* ✅ Step 2: Passport Selection */}
          {step === "passport" && (
            <>
              <PassportSelector selectedCountry={selectedCountry!} />
              <Button
                variant="outline-primary"
                className="mt-3"
                onClick={() => setStep("country")}
              >
                Geri Git
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default SideSelector;
