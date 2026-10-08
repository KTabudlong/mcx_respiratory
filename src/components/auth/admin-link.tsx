import { LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { hasAdminAccess } from '@/lib/permissions';

// Shown only to users whose roles open the admin panel.
export function AdminLink() {
    const { profile } = useAuth();

    if (!hasAdminAccess(profile)) {
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
