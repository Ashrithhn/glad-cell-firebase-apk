'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password?: string;
}

const strengthChecks = [
  {
    label: 'At least 8 characters long',
    test: (p: string) => p.length >= 8,
  },
  {
    label: 'At least one uppercase letter (A-Z)',
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    label: 'At least one lowercase letter (a-z)',
    test: (p: string) => /[a-z]/.test(p),
  },
  {
    label: 'At least one number (0-9)',
    test: (p: string) => /[0-9]/.test(p),
  },
  {
    label: 'At least one special character (!@#$...)',
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

export function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  // Don't show the criteria list until user starts typing
  if (!password) {
    return null;
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
      {strengthChecks.map((check, index) => {
        const isMet = check.test(password);
        return (
          <li key={index} className={cn(
            "flex items-center gap-1.5 transition-colors",
            isMet ? 'text-green-600' : 'text-muted-foreground'
          )}>
            {isMet ? (
              <Check className="h-4 w-4 flex-shrink-0" />
            ) : (
              <X className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{check.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
