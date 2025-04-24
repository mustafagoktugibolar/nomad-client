import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card.js";

interface Passport {
  country: string;
  image: string;
  validity: string;
}

interface PassportGridProps {
  passports: Passport[];
  onSelect: (passport: Passport) => void;
  selectedPassport: Passport | null;
}

const PassportGrid: React.FC<PassportGridProps> = ({ passports, onSelect, selectedPassport }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-4 max-h-[600px] overflow-y-auto">
      {passports.map((passport, index) => {
        const isSelected = selectedPassport?.country === passport.country;

        return (
          <Card
            key={index}
            className={`border shadow-md cursor-pointer transition ${
              isSelected ? "border-blue-500 bg-blue-100 hover:shadow-md" : "hover:shadow-lg"
            }`}
            onClick={() => onSelect(passport)}
          >
            {/* Header with Country Name */}
            <CardHeader>
              <CardTitle>{passport.country}</CardTitle>
            </CardHeader>

            {/* Content with Flag & Validity */}
            <CardContent>
              <div className="flex items-center gap-3">
                <img
                  src={passport.image}
                  alt={`${passport.country} Flag`}
                  className="w-10 h-6 rounded"
                />
                <p className="text-sm text-gray-600">Validity: {passport.validity}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PassportGrid;
