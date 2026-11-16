import { Check } from 'lucide-react';

import type { SignupStep } from '@/lib/account-status';
import { SIGNUP_STEPS } from '@/lib/account-status';
import { cn } from '@/lib/utils';

export function SignupProgress({ current }: { current: SignupStep }) {
    const currentIndex = SIGNUP_STEPS.findIndex(({ step }) => step === current);

    return (
        <ol className="flex items-center gap-2" aria-label="Sign-up progress">
            {SIGNUP_STEPS.map(({ step, label }, index) => {
                const complete = index < currentIndex || current === 'done';
                const active = index === currentIndex;

                return (
                    <li
                        key={step}
                        className="flex flex-1 items-center gap-2"
                        aria-current={active ? 'step' : undefined}
                    >
                        <span
                            className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                                complete &&
                                    'border-primary bg-primary text-primary-foreground',
                                active && !complete && 'border-primary',
                            )}
                        >
                            {complete ? (
                                <Check className="size-4" aria-hidden />
                            ) : (
                                index + 1
                            )}
                        </span>
                        <span
                            className={cn(
                                'sr-only text-xs sm:not-sr-only',
                                active
                                    ? 'font-medium'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}
