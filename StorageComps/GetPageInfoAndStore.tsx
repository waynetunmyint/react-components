import { useEffect, useState } from 'react';
import { BASE_URL, PAGE_ID } from '../../../config';
import { setEncryptedItem, getEncryptedItem } from '../HelperComps/encryptionHelper';
import { reinitializeFirebase } from '../_firebase/firebaseConfig';

export default function GetPageInfoAndStore() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPageInfo();
    }, []);

    const getPageInfo = async () => {
        // Check if already stored
        if (getEncryptedItem('StoredEncryptedPage')) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/page/api/${PAGE_ID}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const pageData = data[0];
                // Store encrypted page data
                setEncryptedItem('StoredEncryptedPage', JSON.stringify(pageData));
                console.log('Page info stored successfully');
                
                // Reinitialize Firebase with the new config
                reinitializeFirebase();
            }
        } catch (err) {
            console.error('Failed to fetch page info:', err);
        } finally {
            setLoading(false);
        }
    }
    
    return null;
}
