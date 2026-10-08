// Keep in sync with isValidName() in firestore.rules.
export const MAX_NAME_LENGTH = 50;

export function validateName(label: string, value: string) {
    const trimmed = value.trim();

    if (trimmed === '') {
        return `${label} is required.`;
    }

    if (trimmed.length > MAX_NAME_LENGTH) {
        return `${label} must be ${MAX_NAME_LENGTH} characters or fewer.`;
    }

    return '';
}
