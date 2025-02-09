const CountryList = ({ countries, searchTerm, onSelectCountry }) => {
    return (
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "300px" }}>
        <h6 className="text-muted mb-2">Ülkeler</h6>
        <ul className="list-unstyled">
          {countries
            .filter((country) =>
              country.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((country, index) => (
              <li
                key={index}
                className="d-flex align-items-center p-2"
                style={{ cursor: "pointer" }}
                onClick={() => onSelectCountry(country.name)}
              >
                <span className="fs-4 me-2">{country.flag}</span>
                <span>{country.name}</span>
              </li>
            ))}
        </ul>
      </div>
    );
  };
  
  export default CountryList;
  