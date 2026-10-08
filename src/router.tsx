import { createHashRouter } from 'react-router';

import { GuestOnly } from '@/components/auth/guest-only';
import { RequireAuth } from '@/components/auth/require-auth';
import { RequirePermission } from '@/components/auth/require-permission';
import AuthLayout from '@/layouts/auth-layout';
import { ADMIN_PERMISSIONS } from '@/lib/permissions';
import ForgotPassword from '@/pages/auth/forgot-password';
import Login from '@/pages/auth/login';
import Signup from '@/pages/auth/signup';
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';
import Pending from '@/pages/pending';

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
    // Admin panel: lazy-loaded so students never download it. Admins don't
    // need a class to open it (allowPending).
    {
        path: '/admin',
        element: <RequireAuth allowPending />,
        children: [
            {
                element: <RequirePermission anyOf={ADMIN_PERMISSIONS} />,
                children: [
                    {
                        lazy: {
                            Component: async () =>
                                (await import('@/layouts/admin-layout'))
                                    .default,
                        },
                        children: [
                            {
                                index: true,
                                lazy: {
                                    Component: async () =>
                                        (await import('@/pages/admin/index'))
                                            .default,
                                },
                            },
                            {
                                element: (
                                    <RequirePermission anyOf={['users.view']} />
                                ),
                                children: [
                                    {
                                        path: 'users',
                                        lazy: {
                                            Component: async () =>
                                                (
                                                    await import('@/pages/admin/users/index')
                                                ).default,
                                        },
                                    },
                                ],
                            },
                            {
                                element: (
                                    <RequirePermission
                                        anyOf={['classes.manage']}
                                    />
                                ),
                                children: [
                                    {
                                        path: 'classes',
                                        lazy: {
                                            Component: async () =>
                                                (
                                                    await import('@/pages/admin/classes/index')
                                                ).default,
                                        },
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
