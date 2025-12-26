
export const checkFirebaseConnectivity = async (): Promise<boolean> => {
    try {
        // Attempt to fetch a small Firebase resource with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('https://www.googleapis.com/identitytoolkit/v3/relyingparty/publicKeys', {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return true; // If we get any response (even no-cors), it means the domain is reachable
    } catch (error) {
        console.warn('Firebase connectivity check failed:', error);
        return false;
    }
};
