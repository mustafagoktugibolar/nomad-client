import * as React from "react";
import { Input } from "../ui/input.js";
import { Button } from "../ui/button.js";
import { IoMdMenu } from "react-icons/io";

interface SearchBarProps {
  width?: string;
  inputGroupClass?: string;
  showMenuIcon?: boolean;
  searchValue: string;
  placeholder?: string;
  onSearchChange: (value: string) => void;
  onMenuClick?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  width,
  inputGroupClass,
  showMenuIcon,
  searchValue,
  placeholder,
  onSearchChange,
  onMenuClick,
}) => {
  return (
    <div className={`flex items-center rounded-lg p-2 bg-white ${inputGroupClass}`} style={{ width }}>
      {showMenuIcon && (
        <Button onClick={onMenuClick} className="shadow-none bg-white p-2 flex items-center justify-center w-10 h-10">
          <IoMdMenu className="w-6 h-6 text-black" />
        </Button>
      )}
      <Input
        type="text"
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 shadow-none focus-visible:ring-0 focus-visible:border-0"
      />
    </div>
  );
};

export default SearchBar;
