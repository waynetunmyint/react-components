import React, { useEffect } from 'react'
import { BASE_URL, PAGE_ID } from '@/config';
import { setEncryptedItem } from '../HelperComps/encryptionHelper';

export default function GetFirebaseConfigComp() {

    useEffect(() => {
        getPageInformation();
    }, []);
    const getPageInformation = async () => {
        try {
            const response = await fetch(`${BASE_URL}/page/api/${PAGE_ID}`);
            if (!response.ok) throw new Error(`Failed to fetch page info: ${response.statusText}`);
            const responseJson = await response.json();
            setEncryptedItem('StoredPage', responseJson[0] || {});
        } catch (err) {
            console.error('Error fetching page information:', err);
            return null;
        }
    };

    return (
        <div>GetFirebaseConfig</div>
    )
}
