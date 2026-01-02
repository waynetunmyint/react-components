import { useState, useEffect } from "react";
import { BASE_URL, PAGE_ID } from "@/config";

/**
 * Standardizes Block names into base dataSource names (e.g. BrandOne -> brand)
 */
export const toLocaleDataSource = (block: string) => {
    if (!block) return "";
    // Standard extraction: get the base name (e.g. "Brand" from "BrandOne", "Product" from "ProductList")
    const match = block.match(/^(Article|Brand|Product|Service|Course|Book|University|Project|Testimonial|Address|Advantage|Client|CustomSlider|Certificate|Page)/i);
    const base = match ? match[0] : block;
    return base.charAt(0).toLowerCase() + base.slice(1);
};

export const usePageData = () => {
    const [pageData, setPageData] = useState<any>(null);
    const [sortedItems, setSortedItems] = useState<any[]>([]);
    const [activeSources, setActiveSources] = useState<string[]>([]);
    const [contactInfo, setContactInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const CACHE_KEY_PAGE = `page_data_${PAGE_ID}`;
    const CACHE_KEY_SORTED = `sorted_items_${PAGE_ID}`;

    useEffect(() => {
        // Load from cache initially
        const cachedPageData = localStorage.getItem(CACHE_KEY_PAGE);
        const cachedSortedItems = localStorage.getItem(CACHE_KEY_SORTED);

        if (cachedPageData) {
            try {
                setPageData(JSON.parse(cachedPageData));
            } catch (e) {
                console.error("Failed to parse cached page data", e);
            }
        }

        if (cachedSortedItems) {
            try {
                setSortedItems(JSON.parse(cachedSortedItems));
                setLoading(false); // If we have cached items, we can stop showing the main loader early
            } catch (e) {
                console.error("Failed to parse cached sorted items", e);
            }
        }

        const fetchPageData = async () => {
            try {
                const url = `${BASE_URL}/page/api/${PAGE_ID}`;
                const contactUrl = `${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`;

                const [pRes, cRes] = await Promise.all([fetch(url), fetch(contactUrl)]);
                const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);

                const data = Array.isArray(pData) ? pData[0] : pData;
                const contact = Array.isArray(cData) ? cData[0] : cData;

                if (contact) setContactInfo(contact);

                if (data) {
                    setPageData(data);
                    localStorage.setItem(CACHE_KEY_PAGE, JSON.stringify(data));

                    if (data.ItemList) {
                        const parsed = typeof data.ItemList === 'string' ? JSON.parse(data.ItemList) : data.ItemList;
                        if (Array.isArray(parsed)) {
                            const sorted = parsed.sort((a: any, b: any) => Number(a.Weight || 0) - Number(b.Weight || 0));
                            setSortedItems(sorted);
                            setActiveSources([...new Set(sorted.map(i => toLocaleDataSource(i.Block)))].filter(Boolean));
                            localStorage.setItem(CACHE_KEY_SORTED, JSON.stringify(sorted));
                        }
                    }
                }
            } catch (err) {
                console.error("Fetch Page Data Error:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, []);

    return { pageData, sortedItems, activeSources, contactInfo, loading, error };
}
