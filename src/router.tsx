import { createHashRouter } from 'react-router';

import Home from '@/pages/home';
import NotFound from '@/pages/not-found';

// Hash router: GitHub Pages can't rewrite URLs, so routes live after the # (e.g. /#/posts/123).
export const router = createHashRouter([
    { path: '/', element: <Home /> },
    { path: '*', element: <NotFound /> },
]);
