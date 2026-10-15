// Some mail apps and browsers cut off longer mailto: links, so past this the
// UI offers "copy addresses" instead.
export const MAILTO_MAX_LENGTH = 2000;

// Trimmed, lowercased, without blanks or duplicates, in the original order.
export function uniqueEmails(emails: string[]) {
    return [
        ...new Set(
            emails.map((email) => email.trim().toLowerCase()).filter(Boolean),
        ),
    ];
}

// A mailto: link with everyone in BCC so students don't see each other's
// addresses.
export function mailtoBcc(emails: string[]) {
    return `mailto:?bcc=${emails.map(encodeURIComponent).join(',')}`;
}
