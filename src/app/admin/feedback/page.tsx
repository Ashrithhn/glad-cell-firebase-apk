
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, AlertCircle, PlusCircle } from 'lucide-react';
import { getAllFeedback } from '@/services/feedback';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FeedbackListClient } from '@/components/features/feedback/feedback-list-client';
import { getCurrentUser } from '@/lib/server-utils';
import { redirect } from 'next/navigation';

async function loadFeedback() {
    const { profile } = await getCurrentUser();
    if (profile?.role !== 'Super Admin') {
        return { feedback: [], error: 'You do not have permission to view this page.' };
    }
    const result = await getAllFeedback();
    if (result.success) {
        return { feedback: result.feedback || [] };
    }
    return { feedback: [], error: result.message || "Failed to fetch feedback." };
}

export default async function AdminManageFeedbackPage() {
    const { profile } = await getCurrentUser();
    if (profile?.role !== 'Super Admin') {
        redirect('/admin/dashboard');
    }
  
    const { feedback, error } = await loadFeedback();

    return (
    <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-6">
            <Button asChild variant="outline">
                <Link href="/admin/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </Button>
        </div>

        <Card className="shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <MessageSquare className="h-6 w-6" /> Manage Feedback & Testimonials
                    </CardTitle>
                    <CardDescription>
                    Review user feedback and create testimonials for the homepage.
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Could not load feedback</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}
            <FeedbackListClient initialFeedback={feedback} />
        </CardContent>
        </Card>
    </div>
    );
}
