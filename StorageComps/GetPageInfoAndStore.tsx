import { useEffect, useState } from 'react';
import { BASE_URL, PAGE_ID } from '@/config';
import { setEncryptedItem, getEncryptedItem } from '../HelperComps/encryptionHelper';
import { initializeFirebase } from '../_firebase/firebaseConfig';

export default function GetPageInfoAndStore() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPageInfo();
    }, []);

    const getPageInfo = async () => {
        // Check if already stored
        if (getEncryptedItem(`StoredEncryptedPage_${PAGE_ID}`)) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/page/api/${PAGE_ID}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const pageData = data[0];
                // Store encrypted page data
                setEncryptedItem(`StoredEncryptedPage_${PAGE_ID}`, JSON.stringify(pageData));
                console.log('Page info stored successfully');

                // Reinitialize Firebase with the new config
                initializeFirebase();
            }
        } catch (err) {
            console.error('Failed to fetch page info:', err);
        } finally {
            setLoading(false);
        }
    }

    return null;
}
