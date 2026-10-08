import { createHashRouter } from 'react-router';

import { GuestOnly } from '@/components/auth/guest-only';
import { RequireAuth } from '@/components/auth/require-auth';
import AuthLayout from '@/layouts/auth-layout';
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
    { path: '*', element: <NotFound /> },
]);
