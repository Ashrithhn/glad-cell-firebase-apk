
import { getSiteSettings } from '@/services/site-settings';
import { AlertTriangle } from 'lucide-react';

export async function MaintenanceBanner() {
  const { settings, success } = await getSiteSettings();

  if (success && settings?.maintenanceMode) {
    return (
      <div className="maintenance-banner flex items-center justify-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <span>
          The site is currently under maintenance. Some features may be unavailable. We appreciate your patience.
        </span>
      </div>
    );
  }

  return null; // Don't render anything if maintenance mode is off or settings fail to load
}
