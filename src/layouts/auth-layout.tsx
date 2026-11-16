import { Outlet } from 'react-router';

export default function AuthLayout() {
    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-4 sm:p-6">
            <p className="text-center text-lg font-semibold">
                MXC Respiratory Therapy
            </p>
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </main>
    );
}
