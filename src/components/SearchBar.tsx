import React from "react";
import { Form, InputGroup, Container } from "react-bootstrap";
import { FaBars, FaSearch } from "react-icons/fa";
import classNames from "classnames";

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  width?: string;
  placeholder?: string;
  onSearchChange?: (value: string) => void;
  menuIcon?: React.ComponentType<any>;
  searchIcon?: React.ComponentType<any>;
  value?: string;
  showMenuIcon?: boolean;
  showSearchIcon?: boolean;
  containerClass?: string;
  inputGroupClass?: string;
  inputClass?: string;
  iconClass?: string;
}


const SearchBar: React.FC<SearchBarProps> = ({
  width = "100%",
  placeholder = "Search...",
  onSearchChange = () => {},
  menuIcon: MenuIcon = FaBars,
  searchIcon: SearchIcon = FaSearch,
  value = "",
  showMenuIcon = false,
  showSearchIcon = false,
  containerClass = "",
  inputGroupClass = "",
  inputClass = "",
  iconClass = "",
  ...props
}) => {
  return (
    <Container fluid className={classNames("p-0", containerClass)} style={{ width }}>
      <InputGroup className={classNames("shadow-sm rounded", inputGroupClass)}>
        {showMenuIcon && (
          <InputGroup.Text className={classNames("bg-white border-0", iconClass)}>
            <MenuIcon className="text-muted" />
          </InputGroup.Text>
        )}

        <Form.Control
          type="text"
          placeholder={placeholder}
          className={classNames("border-0 bg-white custom-search-input", inputClass)}
          style={{ height: "45px" }}
          value={value}
          onChange={(e) => onSearchChange(e.target.value)}
          {...props}
        />

        {showSearchIcon && (
          <InputGroup.Text className={classNames("bg-white border-0", iconClass)}>
            <SearchIcon className="text-muted" />
          </InputGroup.Text>
        )}
      </InputGroup>
    </Container>
  );
};

export default SearchBar;
