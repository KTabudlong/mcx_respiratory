import { useNavigate } from 'react-router';

import { logOut } from '@/lib/auth';

// Logging out lands on a clean /login, so the next person to sign in on
// this browser goes to their own home page, not the page left open.
export function useLogOut() {
    const navigate = useNavigate();

    return async () => {
        await logOut();
        navigate('/login', { replace: true });
    };
}
