import './SearchBar.css';

function SearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search for kudos boards, themes...',
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <span className="search-bar__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        className="search-bar__input"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label="Search boards"
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={onClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
      <button type="submit" className="search-bar__submit">Search</button>
    </form>
  );
}

export default SearchBar;
