
'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Lightbulb, Users, Rocket } from 'lucide-react';

export function PageLoader() {
  const { loading } = useAuth();

  if (!loading) {
    return null;
  }

  return (
    <div className="page-loader" aria-label="Loading page content" role="status">
      <div className="icon-loader">
        <Lightbulb />
        <Users />
        <Rocket />
      </div>
    </div>
  );
}
