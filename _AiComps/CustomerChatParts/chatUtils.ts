import { PAGE_ID } from "@/config";

export function getOrCreateGuestId() {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem(`PersistentGuestId_${PAGE_ID}`);
    if (!id) {
        id = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(`PersistentGuestId_${PAGE_ID}`, id);
    }
    return id;
}

export function getStoredGuestInfo() {
    if (typeof window === "undefined") return { name: "", phone: "", email: "", company: "" };
    return {
        name: localStorage.getItem(`StoredGuestName_${PAGE_ID}`) || "",
        phone: localStorage.getItem(`StoredGuestPhone_${PAGE_ID}`) || "",
        email: localStorage.getItem(`StoredGuestEmail_${PAGE_ID}`) || "",
        company: localStorage.getItem(`StoredGuestCompany_${PAGE_ID}`) || ""
    };
}

export const saveToLocal = (targetId: string, data: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`StoredMessages_${PAGE_ID}_${targetId}`, JSON.stringify(data));
};

export const loadFromLocal = (targetId: string) => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(`StoredMessages_${PAGE_ID}_${targetId}`);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch (e) {
        return null;
    }
};

export function getPlatform(): 'web' | 'android' | 'ios' {
    if (typeof window === "undefined") return 'web';
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/android/i.test(userAgent)) {
        return 'android';
    }

    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        return 'ios';
    }

    return 'web';
}
