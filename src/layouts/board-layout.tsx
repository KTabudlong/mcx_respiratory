import { Outlet } from 'react-router';

import { BoardTopBar } from '@/components/board/board-top-bar';

// Reddit-style shell for students: top bar, then each page's content.
export default function BoardLayout() {
    return (
        <div className="min-h-svh bg-muted/30">
            <BoardTopBar />
            <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
                <Outlet />
            </main>
        </div>
    );
}
