/**
 * Normalizes a phone number to E.164 (`+13125551234`).
 * Returns `''` for an empty input and `null` when the number isn't valid.
 * Numbers without a `+` are treated as US numbers.
 */
export function toE164(input: string) {
    const trimmed = input.trim();

    if (trimmed === '') {
        return '';
    }

    const digits = trimmed.replace(/\D/g, '');

    if (trimmed.startsWith('+')) {
        return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
    }

    if (digits.length === 10) {
        return `+1${digits}`;
    }

    if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
    }

    return null;
}

// Displays US numbers as (312) 555-1234; other numbers stay in E.164.
export function formatPhone(e164: string) {
    const match = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);

    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : e164;
}
