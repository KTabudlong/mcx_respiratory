import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

// Shown only to super admins and people whose class role has admin.access.
export function AdminLink() {
    const { hasAdminAccess } = useAuth();

    if (!hasAdminAccess) {
        return null;
    }

    return (
        <Button asChild>
            <Link to="/admin">
                <LayoutDashboard aria-hidden />
                Open admin panel
            </Link>
        </Button>
    );
}
