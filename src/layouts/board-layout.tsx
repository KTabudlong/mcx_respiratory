import { Outlet } from 'react-router';

import { BoardTopBar } from '@/components/board/board-top-bar';
import { ClassInvites } from '@/components/board/class-invites';

// Reddit-style shell for students: top bar, then each page's content.
export default function BoardLayout() {
    return (
        <div className="min-h-svh bg-muted/30">
            <BoardTopBar />
            <main className="mx-auto grid w-full max-w-6xl gap-4 p-4 sm:p-6">
                <ClassInvites />
                <div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
