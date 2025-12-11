import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../ui/popover.js";
import FilterButton from "./FilterButton.js";

interface FilterPopoverButtonProps {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
}

const FilterPopoverButton: React.FC<FilterPopoverButtonProps> = ({
  icon,
  label,
  isSelected,
  onOpenChange,
  children,
  open,
  className = "",
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <FilterButton
          icon={icon}
          label={label}
          isSelected={isSelected}
          className={className}
        />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="center"
        className="w-64 mb-2 p-4 bg-white rounded-lg shadow-lg"
        sideOffset={8}
        collisionPadding={10}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
};

export default FilterPopoverButton;
