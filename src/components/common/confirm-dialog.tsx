import { useState } from 'react';
import { toast } from 'sonner';

import { FormMessage } from '@/components/common/form-message';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getErrorMessage } from '@/lib/errors';

// Rendered only while open; closing unmounts it so state resets.
// `successMessage` is toasted once the action succeeds; errors stay inline.
export function ConfirmDialog({
    title,
    description,
    confirmLabel,
    successMessage,
    destructive = false,
    onConfirm,
    onClose,
}: {
    title: string;
    description: string;
    confirmLabel: string;
    successMessage: string;
    destructive?: boolean;
    onConfirm: () => Promise<unknown>;
    onClose: () => void;
}) {
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function handleConfirm() {
        setBusy(true);
        setError('');

        try {
            await onConfirm();
            toast.success(successMessage);
            onClose();
        } catch (err) {
            setError(getErrorMessage(err));
            setBusy(false);
        }
    }

    return (
        <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <FormMessage message={error} />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={busy}>
                        Cancel
                    </Button>
                    <Button
                        variant={destructive ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={busy}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
