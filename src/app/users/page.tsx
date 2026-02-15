
import { getAllUsers } from '@/services/users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function UsersPage() {
    const { users } = await getAllUsers();

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Registered Users</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users?.map((user) => (
                    <Card key={user.id} className="flex items-center p-4 space-x-4 hover:shadow-lg transition-shadow">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{user.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{user.role}</p>
                            {user.branch && <p className="text-xs text-muted-foreground">{user.branch}</p>}
                        </div>
                    </Card>
                ))}
                {!users?.length && <p>No registered users found.</p>}
            </div>
        </div>
    );
}
