import React from "react";
import { Button } from "../ui/button.js";

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
  const defaultBase = "flex flex-col items-center px-4 py-6 transition-none";
  const selectedClasses = "bg-white shadow-sm border border-border";
  const unselectedClasses =
    "bg-transparent border-none shadow-none hover:bg-transparent";

  const effectiveBase = className ? "" : defaultBase;

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`${effectiveBase} ${
        isSelected ? selectedClasses : unselectedClasses
      } ${className}`}
    >
      {icon}
      <span className="text-xs text-gray-700">{label}</span>
    </Button>
  );
};

export default FilterButton;
