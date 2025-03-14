import SearchBar from "./SearchBar";

const CountrySearchInput = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="mb-3">
      <h5 className="fw-bold fs-5 mb-3">Hangi ülkenin pasaportuna sahipsin?</h5>
      <SearchBar
        placeholder="Ülke ara veya seç"
        value={searchTerm}
        onSearchChange={setSearchTerm}
        showSearchIcon={true}
      />
    </div>  
  );
};

export default CountrySearchInput;
