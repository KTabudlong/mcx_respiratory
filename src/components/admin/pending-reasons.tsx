// Why a pending account is waiting (see lib/pending-reasons).
export function PendingReasons({ reasons }: { reasons: string[] }) {
    return (
        <ul className="grid gap-0.5 text-xs text-muted-foreground">
            {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
            ))}
        </ul>
    );
}
