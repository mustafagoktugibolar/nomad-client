// components/FilterButton.tsx
import React from "react";
import { Button } from "../components/ui/button.js";

interface FilterButtonProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onClick?: () => void;
  className?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  icon,
  label,
  isSelected,
  onClick,
  className = "",
}) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className={`flex flex-col items-center px-4 py-2 border-0 ${
        isSelected ? "bg-white" : "bg-transparent hover:bg-[#E2E4E9]"
      } ${className}`}
    >
      {icon}
      <span className="text-xs text-gray-700 mt-1">{label}</span>
    </Button>
  );
};

export default FilterButton;
