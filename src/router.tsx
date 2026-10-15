import type { ComponentType } from 'react';
import { createHashRouter } from 'react-router';

import { GuestOnly } from '@/components/auth/guest-only';
import { RequireAuth } from '@/components/auth/require-auth';
import {
    RequireAdminAccess,
    RequireClassPermission,
    RequireSuperAdmin,
} from '@/components/auth/require-permission';
import AuthLayout from '@/layouts/auth-layout';
import ForgotPassword from '@/pages/auth/forgot-password';
import Login from '@/pages/auth/login';
import Signup from '@/pages/auth/signup';
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';
import Pending from '@/pages/pending';

// Code-split route: the page downloads the first time it's opened.
function lazyPage(load: () => Promise<{ default: ComponentType }>) {
    return { lazy: { Component: async () => (await load()).default } };
}

// Hash router: GitHub Pages can't rewrite URLs, so routes live after the # (e.g. /#/posts/123).
export const router = createHashRouter([
    {
        element: <AuthLayout />,
        children: [
            {
                element: <GuestOnly />,
                children: [
                    { path: '/login', element: <Login /> },
                    { path: '/forgot-password', element: <ForgotPassword /> },
                ],
            },
            { path: '/signup', element: <Signup /> },
            {
                element: <RequireAuth allowPending />,
                children: [{ path: '/pending', element: <Pending /> }],
            },
        ],
    },
    {
        element: <RequireAuth />,
        children: [{ path: '/', element: <Home /> }],
    },
    // Admin panel: lazy-loaded so students never download it. Super admins
    // don't need a class to open it (allowPending).
    {
        path: '/admin',
        element: <RequireAuth allowPending />,
        children: [
            {
                element: <RequireAdminAccess />,
                children: [
                    {
                        ...lazyPage(() => import('@/layouts/admin-layout')),
                        children: [
                            {
                                index: true,
                                ...lazyPage(
                                    () => import('@/pages/admin/index'),
                                ),
                            },
                            {
                                element: <RequireSuperAdmin />,
                                children: [
                                    {
                                        path: 'classes',
                                        ...lazyPage(
                                            () =>
                                                import('@/pages/admin/classes/index'),
                                        ),
                                    },
                                    {
                                        path: 'users',
                                        ...lazyPage(
                                            () =>
                                                import('@/pages/admin/users/index'),
                                        ),
                                    },
                                ],
                            },
                            // One class's admin pages; each checks the
                            // user's role in :classId.
                            {
                                path: 'classes/:classId',
                                element: (
                                    <RequireClassPermission
                                        anyOf={['admin.access']}
                                    />
                                ),
                                children: [
                                    {
                                        index: true,
                                        ...lazyPage(
                                            () =>
                                                import('@/pages/admin/classes/show'),
                                        ),
                                    },
                                    {
                                        path: 'students',
                                        element: (
                                            <RequireClassPermission
                                                anyOf={[
                                                    'students.view',
                                                    'students.manage',
                                                ]}
                                            />
                                        ),
                                        children: [
                                            {
                                                index: true,
                                                ...lazyPage(
                                                    () =>
                                                        import('@/pages/admin/classes/students'),
                                                ),
                                            },
                                        ],
                                    },
                                    {
                                        path: 'roles',
                                        element: (
                                            <RequireClassPermission
                                                anyOf={['roles.manage']}
                                            />
                                        ),
                                        children: [
                                            {
                                                index: true,
                                                ...lazyPage(
                                                    () =>
                                                        import('@/pages/admin/classes/roles'),
                                                ),
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
    { path: '*', element: <NotFound /> },
]);
