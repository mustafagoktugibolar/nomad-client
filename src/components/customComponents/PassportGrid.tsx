import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card.js";
import { CheckCircle } from "lucide-react";

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

const PassportGrid: React.FC<PassportGridProps> = ({
  passports,
  onSelect,
  selectedPassport,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4  ">{/* reduced gap */}
      {passports.map((passport, idx) => {
        const isSelected = selectedPassport?.country === passport.country;

        return (
          <Card
            key={idx}
            onClick={() => onSelect(passport)}
            className={`
              relative cursor-pointer rounded-md border p-3 transition leading-tight
               ${isSelected
                ? "border-[#2CB386] bg-[#E6F9F2]"
                : "border-gray-200 bg-white hover:border-[#2CB386] hover:bg-[#E6F9F2]"
              }
            `}
          >
            {/* check badge */}
            {isSelected && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-[#2CB386] rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}

            {/* passport cover */}
            <div className="flex justify-center">
              <img
                src={passport.image}
                alt={`${passport.country} passport cover`}
                className="h-18 w-auto"
              />
            </div>

            {/* title */}
            <CardHeader className="p-0 mb-0.5 text-center">
              <CardTitle className="text-sm font-medium">
                {passport.country} Passport
              </CardTitle>
            </CardHeader>

            {/* subtitle */}
            <CardContent className="p-0 text-center">
              <p className="text-[11px] text-gray-600">
                {passport.validity} info
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PassportGrid;
