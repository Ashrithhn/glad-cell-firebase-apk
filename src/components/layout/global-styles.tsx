
'use client';

import React from 'react';

export function GlobalStyles() {
  return (
    <style jsx global>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        @keyframes slide-in-left {
            0% {
                opacity: 0;
                transform: translateX(-50px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .animate-slide-in-left {
            animation: slide-in-left 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            animation-delay: 0.3s; /* Stagger animation */
            opacity: 0; /* Start hidden for animation */
        }

        @keyframes slide-in-right {
            0% {
                opacity: 0;
                transform: translateX(50px);
            }
            100% {
                opacity: 1;
                transform: translateX(0);
            }
        }
        .animate-slide-in-right {
            animation: slide-in-right 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            animation-delay: 0.5s; /* Stagger animation */
            opacity: 0; /* Start hidden for animation */
        }

        /* Ensure header height is accounted for on home page */
        :root {
          --header-height: 4rem; /* Default, adjust if header height changes */
        }
     `}</style>
  );
}
