import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import CountrySelector from "./CountrySelector";
import PassportSelector from "./PassportSelector";
import SearchBar from "./SearchBar";

const SideSelector = () => {
  const [step, setStep] = useState("country");
  const [selectedCountry, setSelectedCountry] = useState(null);

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
      <SearchBar width="100%" inputGroupClass="bg-success" showMenuIcon= {true} />

      {/* ✅ SideSelector - Adjusted Height to `100vh - 100px` */}
      <Card
        className="shadow-lg p-3 rounded border-0 mt-3 w-100"
        style={{
          height: "calc(100vh - 120px)",
          overflowY: "auto", 
        }}
      >
        <Card.Body className="d-flex flex-column">
          {/* ✅ Step Navigation */}
          <div className="d-flex align-items-center mb-3">
            <span className={`fw-bold me-2 ${step === "country" ? "text-primary" : "text-muted"}`}>
              1 Ülke Seç
            </span>
            <span className="text-muted mx-2">→</span>
            <span className={`fw-bold ${step === "passport" ? "text-primary" : "text-muted"}`}>
              2 Pasaport Seç
            </span>
          </div>

          {/* ✅ Step 1: Country Selection */}
          {step === "country" && (
            <CountrySelector
              onSelectCountry={(country) => {
                setSelectedCountry(country);
                setStep("passport");
              }}
            />
          )}

          {/* ✅ Step 2: Passport Selection */}
          {step === "passport" && (
            <>
              <PassportSelector selectedCountry={selectedCountry} />
              <Button variant="outline-primary" className="mt-3" onClick={() => setStep("country")}>
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
