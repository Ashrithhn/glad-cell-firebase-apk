
'use client';

import React, { useState, useEffect } from 'react';

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Adjust delay as needed (e.g., 1500ms)
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="page-loader" aria-label="Loading page content" role="status">
      <div className="spinner"></div>
    </div>
  );
}
