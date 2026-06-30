import { useEffect, useRef, useState } from 'react';
import './GiphyPicker.css';

const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY;
const GIPHY_ENDPOINT = 'https://api.giphy.com/v1/gifs/search';

function GiphyPicker({ value, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!GIPHY_KEY) return;
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        const url = `${GIPHY_ENDPOINT}?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=12&rating=g`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('GIPHY search failed');
        const json = await res.json();
        setResults(json.data ?? []);
      } catch (err) {
        setError(err.message);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Fallback when no GIPHY key is configured: let the user paste a URL.
  if (!GIPHY_KEY) {
    return (
      <div className="giphy-picker giphy-picker--fallback">
        <label className="giphy-picker__field">
          <span>Gif URL (required)</span>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="https://media.giphy.com/..."
            required
          />
        </label>
        <p className="giphy-picker__hint">
          Set <code>VITE_GIPHY_API_KEY</code> in <code>frontend/.env</code> to enable search.
        </p>
      </div>
    );
  }

  return (
    <div className="giphy-picker">
      <input
        type="text"
        className="giphy-picker__search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search GIPHY..."
        aria-label="Search GIPHY"
      />

      {error && <p className="giphy-picker__error">{error}</p>}

      {isSearching && <p className="giphy-picker__status">Searching…</p>}

      {!isSearching && results.length > 0 && (
        <div className="giphy-picker__grid" role="list">
          {results.map((gif) => {
            const url = gif.images?.fixed_width?.url ?? gif.images?.original?.url;
            const fullUrl = gif.images?.original?.url ?? url;
            const isSelected = value === fullUrl;
            return (
              <button
                key={gif.id}
                type="button"
                className={`giphy-picker__thumb ${isSelected ? 'giphy-picker__thumb--selected' : ''}`}
                onClick={() => onChange?.(fullUrl)}
                aria-label={`Pick gif: ${gif.title || gif.id}`}
                aria-pressed={isSelected}
                role="listitem"
              >
                <img src={url} alt={gif.title || ''} loading="lazy" />
              </button>
            );
          })}
        </div>
      )}

      {value && (
        <div className="giphy-picker__preview">
          <span className="giphy-picker__preview-label">Selected:</span>
          <img src={value} alt="" />
        </div>
      )}
    </div>
  );
}

export default GiphyPicker;
