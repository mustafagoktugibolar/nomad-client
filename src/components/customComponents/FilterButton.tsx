import React from "react";
import { Button } from "../ui/button.js";

interface FilterButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  // onClick included in ComponentPropsWithoutRef
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ icon, label, isSelected, className = "", onClick, ...props }, ref) => {
    const defaultBase = "flex flex-col items-center px-4 py-6 transition-none";
    const selectedClasses = "bg-white shadow-sm border border-border";
    const unselectedClasses =
      "bg-transparent border-none shadow-none hover:bg-transparent";

    const effectiveBase = className ? "" : defaultBase;

    return (
      <Button
        ref={ref}
        variant="ghost"
        onClick={onClick}
        className={`${effectiveBase} ${isSelected ? selectedClasses : unselectedClasses
          } ${className}`}
        {...props}
      >
        {icon}
        <span className="text-xs text-gray-700">{label}</span>
      </Button>
    );
  }
);

FilterButton.displayName = "FilterButton";

export default FilterButton;
