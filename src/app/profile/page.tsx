
// Placeholder Profile Page
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Phone, Building, Hash, MapPin } from 'lucide-react';

// In a real app, this page should be protected and only accessible to logged-in users.
// You would fetch the user's data from your database/auth service.

// Placeholder data - replace with actual fetched data
const userProfile = {
  name: 'Alice Example',
  email: 'alice@example.com',
  phone: '+91-9876543210',
  branch: 'Computer Science',
  semester: 6,
  registrationNumber: '1GC21CS001',
  collegeName: 'Government Engineering College Mosalehosahalli',
  city: 'Hassan',
  pincode: '573131',
};

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <User className="h-6 w-6" /> Your Profile
          </CardTitle>
          <CardDescription>
            View and manage your account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
              <p className="font-semibold">{userProfile.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
              <p className="font-semibold">{userProfile.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
              <p className="font-semibold">{userProfile.phone}</p>
            </div>
          </div>

          <hr className="border-border" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Branch</h3>
                <p className="font-semibold">{userProfile.branch}</p>
              </div>
            </div>
             <div className="flex items-center space-x-4">
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0" /> {/* Placeholder icon */}
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Semester</h3>
                    <p className="font-semibold">{userProfile.semester}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4 col-span-1 sm:col-span-2">
              <Hash className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
                <p className="font-semibold">{userProfile.registrationNumber}</p>
              </div>
            </div>
          </div>

           <hr className="border-border" />

           <div className="flex items-start space-x-4">
            <MapPin className="h-5 w-5 mt-1 text-muted-foreground flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
              <p className="font-semibold">{userProfile.collegeName},</p>
              <p className="font-semibold">{userProfile.city} - {userProfile.pincode}</p>
            </div>
          </div>

          {/* Add buttons for editing profile or changing password if needed */}
           {/*
           <div className="flex justify-end space-x-2 pt-4">
             <Button variant="outline">Edit Profile</Button>
             <Button variant="destructive">Change Password</Button>
           </div>
           */}
        </CardContent>
      </Card>
    </div>
  );
}
