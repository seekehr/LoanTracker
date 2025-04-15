import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const TOKEN_COOKIE_EXPIRY = 1209600;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function addCookie(key: string, value: string, expiryTime: number): void {
    document.cookie = `${key}=${value}; max-age=${expiryTime}; path=/; SameSite=None; Secure`;
}

export function getCookie(key: string): string | undefined {
    if (document.cookie.includes(key)) {
        const cookies = document.cookie.split(';');
        const keyCookie = cookies.find(cookie => cookie.trim().startsWith(key + '='));
        if (keyCookie) {
            return keyCookie.split('=')[1];
        }
    }

    return undefined;
}

export function verifyName(username: string): boolean {
    if (username.length < 8 || username.length > 30) {
        return false;
    }

    if (/\s/.test(username)) {
        return false;
    }

    if (username === 'Loading...' || username === 'trending') {
        return false;
    }

    return /^(?!.*[A-Z])[a-z0-9_]+$/.test(username);
}