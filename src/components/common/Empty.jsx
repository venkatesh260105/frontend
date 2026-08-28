import React from 'react';

export function Empty() {
  return (
    <div className="empty">
      <div className="emptyIcon">🛍️</div>
      <h3>No items found</h3>
      <p>Try browsing another category, clearing price filters or refining your search term.</p>
    </div>
  );
}

export default Empty;
