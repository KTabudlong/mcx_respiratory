export type Crumb = { label: string; to: string };

const SECTION_LABELS: Record<string, string> = {
    classes: 'Classes',
    users: 'Users',
    students: 'Students',
    roles: 'Roles',
    moderation: 'Moderation',
};

// Admin breadcrumbs from the URL path, e.g. /admin/classes/abc/roles →
// Admin › Classes › <class name> › Roles. `names` maps document IDs in the
// path to display names; unknown IDs show as "…" until they load. The
// Classes crumb only links for super admins (it's their page).
export function adminCrumbs(
    pathname: string,
    names: Record<string, string>,
    isSuperAdmin: boolean,
): Crumb[] {
    const parts = pathname.split('/').filter(Boolean);

    if (parts[0] !== 'admin') {
        return [];
    }

    const crumbs: Crumb[] = [{ label: 'Admin', to: '/admin' }];
    let to = '/admin';

    parts.slice(1).forEach((part, index) => {
        to = `${to}/${part}`;

        if (index === 0 && part === 'classes' && !isSuperAdmin) {
            return;
        }

        crumbs.push({
            label: SECTION_LABELS[part] ?? names[part] ?? '…',
            to,
        });
    });

    return crumbs;
}
