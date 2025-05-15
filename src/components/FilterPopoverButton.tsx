import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover.js";
import FilterButton from "./FilterButton.js";

interface FilterPopoverButtonProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const FilterPopoverButton: React.FC<FilterPopoverButtonProps> = ({
  icon,
  label,
  isSelected,
  onOpenChange,
  children,
  className = "",
}) => {
  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <div>
          <FilterButton
            icon={icon}
            label={label}
            isSelected={isSelected}
            className={className}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        className="w-64 p-4 bg-white rounded-lg shadow-lg"
        sideOffset={8}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopoverButton;
