import PocketBase from 'pocketbase';

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pocketbase.io'; // Placeholder URL

export const pb = new PocketBase(pbUrl);

// Enable cookie-based persistence for Next.js SSR
if (typeof document !== 'undefined') {
    pb.authStore.onChange(() => {
        document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
    });
}

export function getPocketBaseServerParams(cookieHeader: string | null) {
    const serverPb = new PocketBase(pbUrl);
    if (cookieHeader) {
        serverPb.authStore.loadFromCookie(cookieHeader);
    }
    return serverPb;
}
