import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchKnowledge } from '../data/siteKnowledge';

function resolveSubmitPath(query, suggestions) {
  const normalizedQuery = query.trim().toLowerCase();
  const exact = suggestions.find((item) => item.label.toLowerCase() === normalizedQuery);

  if (exact) {
    return exact.path;
  }

  const firstProduct = suggestions.find((item) => item.type === 'product');
  if (firstProduct) {
    return `/products?search=${encodeURIComponent(query.trim())}`;
  }

  if (suggestions[0]?.path) {
    return suggestions[0].path;
  }

  return `/products?search=${encodeURIComponent(query.trim())}`;
}

const SiteSearch = ({ siteProducts = [], mobile = false, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    if (!query.trim()) {
      return searchKnowledge('products story tours payment', siteProducts, mobile ? 5 : 6);
    }

    return searchKnowledge(query, siteProducts, mobile ? 5 : 6);
  }, [mobile, query, siteProducts]);

  useEffect(() => {
    setIsOpen(false);
    setQuery('');
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const handleResultClick = (path) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
    onNavigate?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!query.trim()) {
      setIsOpen(true);
      return;
    }

    handleResultClick(resolveSubmitPath(query, suggestions));
  };

  return (
    <div
      ref={wrapperRef}
      className={`muwas-site-search ${mobile ? 'muwas-site-search--mobile' : ''}`}
    >
      <form className="muwas-site-search__form" onSubmit={handleSubmit}>
        <Search size={17} strokeWidth={1.9} className="muwas-site-search__icon" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search pages, products, tours..."
          className="muwas-site-search__input"
          aria-label="Search the website"
        />
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="muwas-site-search__results" role="listbox" aria-label="Search suggestions">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              className="muwas-site-search__result"
              onClick={() => handleResultClick(item.path)}
            >
              <span className="muwas-site-search__result-type">{item.type}</span>
              <span className="muwas-site-search__result-copy">
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SiteSearch;
