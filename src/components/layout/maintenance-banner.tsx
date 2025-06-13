
import { getSiteSettings } from '@/services/settings'; // Corrected: Use Supabase settings service
import { AlertTriangle } from 'lucide-react';

export async function MaintenanceBanner() {
  // Fetch settings using the Supabase service
  const settingsResult = await getSiteSettings();

  // Access settings structure for Supabase (settings.maintenance.enabled)
  if (settingsResult.success && settingsResult.settings?.maintenance?.enabled) {
    return (
      <div className="maintenance-banner flex items-center justify-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <span>
          {settingsResult.settings.maintenance.message || "The site is currently under maintenance. Some features may be unavailable. We appreciate your patience."}
        </span>
      </div>
    );
  }

  return null;
}
