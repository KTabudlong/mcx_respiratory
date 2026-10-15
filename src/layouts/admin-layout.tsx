import { ExternalLink } from 'lucide-react';
import { Link, Outlet, useMatch } from 'react-router';

import { AdminBreadcrumbs } from '@/components/admin/admin-breadcrumbs';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';

// CRM-style shell. Lazy-loaded from the router so students never download it.
export default function AdminLayout() {
    const classId = useMatch('/admin/classes/:classId/*')?.params.classId;

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-14 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-4!" />
                    <AdminBreadcrumbs />
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="ml-auto shrink-0"
                    >
                        <Link
                            to={classId ? `/classes/${classId}` : '/'}
                            target="_blank"
                            rel="noopener"
                        >
                            <ExternalLink aria-hidden />
                            Open board
                            <span className="sr-only">
                                {' '}
                                (opens in a new tab)
                            </span>
                        </Link>
                    </Button>
                </header>
                <div className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
