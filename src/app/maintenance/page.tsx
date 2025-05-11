import { getSiteSettings } from '@/services/settings';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MaintenancePage() {
  let maintenanceMessage = "The site is currently down for maintenance. We'll be back shortly!";
  const settingsResult = await getSiteSettings();

  if (settingsResult.success && settingsResult.settings?.maintenance?.message) {
    maintenanceMessage = settingsResult.settings.maintenance.message;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-6 text-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="items-center">
          <AlertTriangle className="h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold text-primary">Under Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground whitespace-pre-line">
            {maintenanceMessage}
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            We apologize for any inconvenience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
