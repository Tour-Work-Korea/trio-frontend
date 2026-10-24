import React from 'react';
import '../styles/koda-brand.css';

// A shared vector wordmark for the club header and footer.
export default function KodaLogo() {
  return (
    <span className="le-koda-logo">
      <img
        src="/koda-assets/koda-wordmark.svg"
        alt="KODA CLUB · Language Exchange"
        width="132"
        height="50"
      />
    </span>
  );
}
