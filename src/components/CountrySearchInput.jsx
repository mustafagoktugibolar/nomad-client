import SearchBar from "./SearchBar";

const CountrySearchInput = ({ searchTerm, setSearchTerm }) => {
  return (
    <>
      <h5 className="fw-bold fs-5 mb-3">Hangi ülkenin pasaportuna sahipsin?</h5>
      <SearchBar
        placeholder="Ülke ara veya seç"
        value={searchTerm}
        onSearchChange={setSearchTerm}
        showSearchIcon={true}
      />
    </>
  );
};

export default CountrySearchInput;
