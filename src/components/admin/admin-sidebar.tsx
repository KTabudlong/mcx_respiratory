import { GraduationCap, LogOut, Users } from 'lucide-react';
import { NavLink, useLocation } from 'react-router';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { logOut } from '@/lib/auth';
import type { Permission } from '@/lib/permissions';

export const ADMIN_NAV: {
    to: string;
    label: string;
    icon: typeof Users;
    permission: Permission;
}[] = [
    {
        to: '/admin/users',
        label: 'Users',
        icon: Users,
        permission: 'users.view',
    },
    {
        to: '/admin/classes',
        label: 'Classes',
        icon: GraduationCap,
        permission: 'classes.manage',
    },
];

export function AdminSidebar() {
    const { profile, can } = useAuth();
    const { setOpenMobile } = useSidebar();
    const { pathname } = useLocation();

    return (
        <Sidebar>
            <SidebarHeader className="px-4 py-3">
                <p className="font-semibold">MXC RT Admin</p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Manage</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {ADMIN_NAV.filter((item) =>
                                can(item.permission),
                            ).map((item) => (
                                <SidebarMenuItem key={item.to}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(item.to)}
                                    >
                                        <NavLink
                                            to={item.to}
                                            onClick={() => setOpenMobile(false)}
                                        >
                                            <item.icon aria-hidden />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <p className="truncate px-2 text-xs text-muted-foreground">
                            {profile?.firstName} {profile?.lastName}
                        </p>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => logOut()}>
                            <LogOut aria-hidden />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
