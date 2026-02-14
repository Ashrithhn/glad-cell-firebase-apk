
'use client'; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Users, Lightbulb, Activity, Settings, FileText, Contact as ContactIcon, Link2, LogOut, QrCode, Image as ImageIcon, HelpCircle, ShieldAlert, CheckCircle, Clock, Megaphone, MessageSquare, BookOpen } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; 
import { useRouter } from 'next/navigation'; 
import { SiteSettingsManager } from '@/components/features/admin/site-settings-manager';
import { Separator } from '@/components/ui/separator';
import type { DashboardStats } from '@/services/dashboard';
import type { SiteSettings } from '@/services/site-settings';
import { motion } from 'framer-motion';

interface DashboardClientProps {
    stats: DashboardStats;
    settings?: SiteSettings;
}

export function DashboardClient({ stats, settings }: DashboardClientProps) {
    const { userProfile, logout } = useAuth(); 
    const router = useRouter(); 

    const handleAdminLogout = async () => {
        await logout();
        router.push('/admin/login');
    };
    
    const userRole = userProfile?.role;
    const isSuperAdmin = userRole === 'Super Admin';
    const showIdeas = settings?.allowIdeaSubmissions ?? true;

    const statCards = [
        { title: "Total Users", value: stats.totalUsers, icon: Users, description: "All registered participants and admins." },
        { title: "Event Registrations", value: stats.totalParticipations, icon: CheckCircle, description: "Total number of event sign-ups." },
    ];
    
    if (showIdeas) {
        statCards.push({ title: "Pending Ideas", value: stats.pendingIdeas, icon: Clock, description: "Ideas awaiting admin review." });
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    let dashboardSections = [
        { title: 'Manage Programs & Events', icon: Activity, description: 'Create, view, and manage all campus programs and events.', href: '/admin/events', buttonText: 'View/Manage List', extraButtonHref: '/admin/events/new', extraButtonText: 'Add New Item', iconExtra: PlusCircle, roles: ['Admin', 'Super Admin'] },
        { title: 'Site Content', icon: FileText, description: 'Edit text for "About", "Contact", "Help/FAQ", and manage site links.', roles: ['Admin', 'Super Admin'],
            subLinks: [
                { href: "/admin/content/about", label: "Edit About Page", icon: FileText },
                { href: "/admin/content/contact", label: "Edit Contact Info", icon: ContactIcon },
                { href: "/admin/content/links", label: "Manage Site Links", icon: Link2 },
                { href: "/admin/content/help", label: "Edit Help/FAQ", icon: HelpCircle },
            ]
        },
        { title: 'Manage Users', icon: Users, description: 'View and manage registered student accounts, levels, and roles.', href: '/admin/users', buttonText: 'View Registered Users', roles: ['Admin', 'Super Admin'] },
        { title: 'Manage Ideas', icon: Lightbulb, description: 'Review, approve, and manage submitted student ideas.', href: '/admin/ideas', buttonText: 'View Submitted Ideas', roles: ['Admin', 'Super Admin'], condition: showIdeas },
        { title: 'Event Attendance', icon: QrCode, description: 'Scan participant QR codes to mark attendance in real-time.', href: '/admin/attendance', buttonText: 'Open Scanner', roles: ['Admin', 'Super Admin'] },
        { title: 'Homepage Content', icon: ImageIcon, description: 'Manage images and promotional pop-ups on the homepage.', roles: ['Admin', 'Super Admin'],
            subLinks: [
                { href: "/admin/content/homepage-images", label: "Manage Images", icon: ImageIcon },
                { href: "/admin/promotions", label: "Manage Promotions", icon: Megaphone },
            ]
        },
        { title: 'Manage Custom Pages', icon: BookOpen, description: 'Create and edit custom static pages for your site.', href: '/admin/pages', buttonText: 'Manage Pages', roles: ['Super Admin'] },
        { title: 'Feedback & Testimonials', icon: MessageSquare, description: 'Review submitted feedback and testimonials.', href: '/admin/feedback', buttonText: 'Manage Feedback', roles: ['Super Admin'] },
    ];
    
    // Filter out sections based on condition
    dashboardSections = dashboardSections.filter(section => section.condition !== false);

    return (
        <>
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold animated-gradient-text tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome, {userProfile?.name || 'Admin'}. Role: <span className="font-semibold text-primary">{userRole}</span></p>
                </div>
                <Button variant="outline" onClick={handleAdminLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                {statCards.map((stat, i) => (
                    <motion.div key={stat.title} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {dashboardSections.filter(section => section.roles.includes(userRole || '')).map((section, i) => (
                     <motion.div key={section.title} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
                        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-primary/20 h-full flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-xl"><section.icon className="h-6 w-6 text-primary"/> {section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 flex-grow flex flex-col justify-end">
                                {section.href && (
                                    <Button asChild variant="default" className="w-full">
                                        <Link href={section.href}>{section.buttonText}</Link>
                                    </Button>
                                )}
                                {section.extraButtonHref && (
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={section.extraButtonHref}>
                                            {section.iconExtra && <section.iconExtra className="mr-2 h-4 w-4"/>}
                                            {section.extraButtonText}
                                        </Link>
                                    </Button>
                                )}
                                {section.subLinks && section.subLinks.map(link => (
                                     <Button asChild variant="outline" className="w-full justify-start text-left" key={link.href}>
                                        <Link href={link.href}><link.icon className="mr-2 h-4 w-4"/> {link.label}</Link>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                     </motion.div>
                ))}


                {/* Super Admin Section */}
                {isSuperAdmin && (
                    <>
                        <motion.div custom={dashboardSections.length} initial="hidden" animate="visible" variants={cardVariants} className="col-span-1 lg:col-span-3">
                            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-destructive/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl text-destructive"><ShieldAlert className="h-6 w-6"/> Admin Account Management</CardTitle>
                                    <CardDescription>
                                    Admin access is managed by promoting registered users.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-2">Creating the First Super Admin</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                            <li>Register a user normally on the public registration page.</li>
                                            <li>Go to your Supabase project's <strong>Table Editor</strong>.</li>
                                            <li>In the `users` table, find your new user and change their `role` column from 'Participant' to 'Super Admin'.</li>
                                        </ol>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-2">Creating Additional Admins</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                            <li>Have the new user register a standard account.</li>
                                            <li>As a Super Admin, navigate to the <Link href="/admin/users" className="text-primary underline">Manage Users</Link> page from this dashboard.</li>
                                            <li>Find the user, edit their profile, and change their 'role' from 'Participant' to 'Admin'.</li>
                                        </ol>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        
                        <motion.div custom={dashboardSections.length + 1} initial="hidden" animate="visible" variants={cardVariants} className="col-span-1 sm:col-span-2 lg:col-span-3">
                            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out rounded-lg overflow-hidden border-secondary/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3 text-xl"><Settings className="h-6 w-6 text-secondary-foreground"/> Super Admin Settings</CardTitle>
                                    <CardDescription>Manage global site configurations like maintenance mode and theme. This section is only visible to Super Admins.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SiteSettingsManager initialSettings={settings} />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </>
                )}
            </div>
        </>
    );
}
