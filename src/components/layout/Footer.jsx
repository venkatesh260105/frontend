import React from 'react';
import { downloadOrdersJSON } from '../../utils/storage';

export function Footer() {
  return (
    <footer>
      <div>
        <b>shopkart+</b>
        <p>Premium modern marketplace experience</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={downloadOrdersJSON}
          className="jsonExportBtn secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          title="Download orders as JSON file"
        >
          📥 Download Orders (JSON)
        </button>
        <span>© {new Date().getFullYear()} ShopKart+. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
