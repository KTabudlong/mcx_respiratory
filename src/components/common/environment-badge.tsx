import { isTestProject } from '@/lib/config';
import { firebaseConfig } from '@/lib/firebase';

// Shown on every page when the app talks to a test Firebase project;
// renders nothing on the live one.
export function EnvironmentBadge() {
    if (!isTestProject(firebaseConfig.projectId)) {
        return null;
    }

    return (
        <div
            role="status"
            className="pointer-events-none fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-amber-950 shadow-md"
        >
            TEST · {firebaseConfig.projectId}
        </div>
    );
}
