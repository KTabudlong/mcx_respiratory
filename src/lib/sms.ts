// "Text selected": there's no free way for the app itself to send SMS, so
// an sms: link opens the sender's own Messages app as a group text.
// Carriers cap group size, so big selections are split into batches.
export const SMS_BATCH_SIZE = 30;

export type SmsPlatform = 'apple' | 'other';

// iPhone, iPad and Mac Messages use a different sms: link format.
export function smsPlatform(userAgent: string): SmsPlatform {
    return /iPhone|iPad|iPod|Macintosh/i.test(userAgent) ? 'apple' : 'other';
}

export function smsLink(
    phones: string[],
    message: string,
    platform: SmsPlatform,
) {
    const body = message.trim() ? encodeURIComponent(message.trim()) : '';

    if (platform === 'apple') {
        return `sms:/open?addresses=${phones.join(',')}${body ? `&body=${body}` : ''}`;
    }

    return `sms:${phones.join(',')}${body ? `?body=${body}` : ''}`;
}

export function inBatches<T>(items: T[], size: number) {
    const batches: T[][] = [];

    for (let start = 0; start < items.length; start += size) {
        batches.push(items.slice(start, start + size));
    }

    return batches;
}
