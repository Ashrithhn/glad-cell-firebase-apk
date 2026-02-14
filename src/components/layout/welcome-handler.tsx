'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const WELCOME_SEEN_KEY = 'gladcell_welcome_seen';

interface WelcomeHandlerProps {
    children: React.ReactNode;
}

export function WelcomeHandler({ children }: WelcomeHandlerProps) {
    const [isClientChecked, setIsClientChecked] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // This effect runs only on the client.
        const welcomeSeen = localStorage.getItem(WELCOME_SEEN_KEY);
        
        if (!welcomeSeen && pathname !== '/welcome') {
            router.replace('/welcome');
        } else {
            // If welcome has been seen, OR we are already on the welcome page,
            // we can allow rendering to proceed.
            setIsClientChecked(true);
        }
    }, [pathname, router]);

    // Return null while the client-side check and potential redirect are happening.
    // This allows the PageLoader in the layout to be visible.
    if (!isClientChecked) {
        return null;
    }
    
    // Once checked, render the children, which will be the correct page based on the route.
    return <>{children}</>;
}
