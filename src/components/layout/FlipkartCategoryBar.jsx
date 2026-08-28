import React from 'react';
import { getCategoryIcon } from '../../utils/categoryIcons';

export function FlipkartCategoryBar({ cats, cat, setCat, setPriceFilter, setPage }) {
  return (
    <div className="flipkartCategoryBar">
      <div className="flipkartCatScroll">
        {cats.slice(0, 16).map(c => {
          const icon = getCategoryIcon(c);
          const displayName = c === 'all' ? 'All Offers' : c.replaceAll('-', ' ');

          return (
            <div key={c} className="flipkartCatItem">
              <button
                type="button"
                className={`flipkartCatBtn ${cat === c ? 'active' : ''}`}
                onClick={() => {
                  setCat(c);
                  setPriceFilter('all');
                  setPage('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className={`flipkartCatIcon ${c.includes('laptop') ? 'laptopIcon' : ''}`}>
                  <span className="catEmoji">{icon}</span>
                </div>
                <span className="flipkartCatName">{displayName}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FlipkartCategoryBar;
