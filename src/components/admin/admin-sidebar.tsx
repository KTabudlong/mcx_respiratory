import {
    GraduationCap,
    LayoutDashboard,
    LogOut,
    ShieldAlert,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';
import { NavLink, useLocation, useMatch } from 'react-router';

import { ClassSwitcher } from '@/components/admin/class-switcher';
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
import { useCollection } from '@/hooks/use-collection';
import { useLogOut } from '@/hooks/use-log-out';
import type { Permission } from '@/lib/permissions';
import type { ClassGroup } from '@/types';

type NavItem = {
    to: string;
    label: string;
    icon: typeof Users;
};

// Pages inside one class, shown when the user's role there allows them.
export const CLASS_NAV: (Omit<NavItem, 'to'> & {
    path: string;
    anyOf: Permission[];
})[] = [
    {
        path: 'students',
        label: 'Students',
        icon: Users,
        anyOf: ['students.view', 'students.manage'],
    },
    {
        path: 'roles',
        label: 'Roles',
        icon: ShieldCheck,
        anyOf: ['roles.manage'],
    },
    {
        path: 'moderation',
        label: 'Moderation',
        icon: ShieldAlert,
        anyOf: ['posts.delete_any', 'comments.delete_any'],
    },
];

const SUPER_ADMIN_NAV: NavItem[] = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/classes', label: 'All classes', icon: GraduationCap },
    { to: '/admin/users', label: 'All users', icon: UserCog },
];

function NavList({ items }: { items: NavItem[] }) {
    const { setOpenMobile } = useSidebar();
    const { pathname } = useLocation();

    return (
        <SidebarMenu>
            {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={pathname === item.to}>
                        <NavLink
                            to={item.to}
                            end
                            onClick={() => setOpenMobile(false)}
                        >
                            <item.icon aria-hidden />
                            <span>{item.label}</span>
                        </NavLink>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

export function AdminSidebar() {
    const { profile, isSuperAdmin, adminClassIds, canIn } = useAuth();
    const logOut = useLogOut();
    const { setOpenMobile } = useSidebar();
    const classes = useCollection<ClassGroup>('classes');
    const classMatch = useMatch('/admin/classes/:classId/*');
    const classId = classMatch?.params.classId;

    const switchable = isSuperAdmin
        ? classes.data
        : classes.data.filter((item) => adminClassIds.includes(item.id));
    const classItems = classId
        ? [
              {
                  to: `/admin/classes/${classId}`,
                  label: 'Overview',
                  icon: LayoutDashboard,
              },
              ...CLASS_NAV.filter((item) =>
                  item.anyOf.some((permission) => canIn(classId, permission)),
              ).map((item) => ({
                  to: `/admin/classes/${classId}/${item.path}`,
                  label: item.label,
                  icon: item.icon,
              })),
          ]
        : [];

    return (
        <Sidebar>
            <SidebarHeader className="gap-3 px-2 py-3">
                <p className="px-2 font-semibold">MXC RT Admin</p>
                <ClassSwitcher
                    classes={switchable}
                    currentClassId={classId}
                    onSwitch={() => setOpenMobile(false)}
                />
            </SidebarHeader>
            <SidebarContent>
                {classItems.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>This class</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <NavList items={classItems} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
                {isSuperAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Super admin</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <NavList items={SUPER_ADMIN_NAV} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <p className="truncate px-2 text-xs text-muted-foreground">
                            {profile?.firstName} {profile?.lastName}
                            {isSuperAdmin && ' · Super admin'}
                        </p>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => void logOut()}>
                            <LogOut aria-hidden />
                            <span>Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
