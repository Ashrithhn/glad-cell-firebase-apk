
import { getDashboardStats } from '@/services/dashboard';
import type { DashboardStats } from '@/services/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Users, Lightbulb, Activity, Settings, FileText, Contact as ContactIcon, Link2, LogOut, QrCode, Image as ImageIcon, HelpCircle, ShieldAlert, CheckCircle, Clock, Megaphone, MessageSquare, BookOpen } from 'lucide-react';
import { SiteSettingsManager } from '@/components/features/admin/site-settings-manager';
import { Separator } from '@/components/ui/separator';
import { DashboardClient } from '@/components/features/admin/dashboard-client';
import { getSiteSettings } from '@/services/site-settings';

async function loadData() {
    const stats = await getDashboardStats();
    const settings = await getSiteSettings();
    // In a real multi-tenant app, you'd also fetch the admin's profile here.
    // For now, we'll let the client component handle the profile display via useAuth.
    return { stats, settings: settings.settings };
}

export default async function AdminDashboardPage() {
    const { stats, settings } = await loadData();

    return (
        <div className="container mx-auto py-12 px-4">
            <DashboardClient stats={stats} settings={settings} />
        </div>
    );
}
