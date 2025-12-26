import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
    data: T[];
    timestamp: number;
}

interface UseCachedPaginatedFetchResult<T> {
    /** All items loaded so far (accumulated across pages) */
    items: T[];
    /** Whether currently loading */
    loading: boolean;
    /** Error message if any */
    error: string | null;
    /** Whether showing cached data while revalidating */
    isFromCache: boolean;
    /** Current page number */
    currentPage: number;
    /** Load more items (next page) */
    loadMore: () => Promise<void>;
    /** Refresh data from the beginning */
    refresh: () => Promise<void>;
}

interface UseCachedPaginatedFetchOptions {
    /** Cache expiration time in milliseconds. Default: 10 minutes */
    cacheTime?: number;
    /** Items per page for initial display */
    itemsPerPage?: number;
}

/**
 * Custom hook for paginated data with "stale-while-revalidate" caching:
 * 1. Shows cached data instantly from localStorage
 * 2. Fetches fresh data in background
 * 3. Supports "Load More" pagination
 */
export function useCachedPaginatedFetch<T = any>(
    baseUrl: string | null,
    options: UseCachedPaginatedFetchOptions = {}
): UseCachedPaginatedFetchResult<T> {
    const { cacheTime = 10 * 60 * 1000, itemsPerPage = 12 } = options;

    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFromCache, setIsFromCache] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);



    // Generate cache key from base URL
    const getCacheKey = useCallback((pageNo: number) => {
        if (!baseUrl) return '';
        const urlKey = btoa(baseUrl).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40);
        return `cache_list_${urlKey}_page_${pageNo}`;
    }, [baseUrl]);

    // Get all cached pages data
    const getAllCachedData = useCallback((): T[] => {
        const allItems: T[] = [];
        let pageNo = 1;

        while (true) {
            try {
                const key = getCacheKey(pageNo);
                const cached = localStorage.getItem(key);
                if (!cached) break;

                const entry: CacheEntry<T> = JSON.parse(cached);
                if (entry.data && entry.data.length > 0) {
                    allItems.push(...entry.data);
                    pageNo++;
                } else {
                    break;
                }
            } catch {
                break;
            }
        }

        return allItems;
    }, [getCacheKey]);

    // Save page data to cache
    const setCachedData = useCallback((pageNo: number, data: T[]) => {
        try {
            const key = getCacheKey(pageNo);
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(key, JSON.stringify(entry));
        } catch (err) {
            console.warn('Failed to cache paginated data:', err);
        }
    }, [getCacheKey]);

    // Normalize API response to array
    const normalizeResponse = (result: any): T[] => {
        if (Array.isArray(result)) return result;
        if (Array.isArray(result?.data)) return result.data;
        if (Array.isArray(result?.items)) return result.items;
        if (Array.isArray(result?.list)) return result.list;
        return [];
    };

    // Fetch a specific page
    const fetchPage = useCallback(async (pageNo: number, append: boolean = false): Promise<T[]> => {
        if (!baseUrl) {
            setError('No URL provided');
            setLoading(false);
            return [];
        }

        const url = `${baseUrl}/${pageNo}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

            const result = await response.json();
            const list = normalizeResponse(result);

            // Cache this page
            setCachedData(pageNo, list);

            return list;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error fetching data';
            throw new Error(message);
        }
    }, [baseUrl, setCachedData]);

    // Initial fetch with cache support
    const initialFetch = useCallback(async () => {
        if (!baseUrl) {
            setError('No data source provided');
            setLoading(false);
            return;
        }

        // First, try to show cached data immediately
        const cachedItems = getAllCachedData();
        let hasDisplayedCache = false;

        if (cachedItems.length > 0) {
            setItems(cachedItems);
            setIsFromCache(true);
            setLoading(false);
            hasDisplayedCache = true;
            console.log(`[MainCMS] Showing ${cachedItems.length} cached items, fetching fresh data...`);
        }

        // Always fetch fresh data for page 1
        try {
            setError(null);
            const freshItems = await fetchPage(1);

            // Smart update: Only replace if data changed
            let shouldUpdate = true;

            if (hasDisplayedCache) {
                // Compare fresh Page 1 with the start of cached items
                // We use JSON.stringify for a deep comparison of the objects
                const cachedFirstPage = cachedItems.slice(0, freshItems.length);
                const isIdentical = JSON.stringify(freshItems) === JSON.stringify(cachedFirstPage);

                if (isIdentical) {
                    console.log('[MainCMS] Fresh data matches cache, preserving full list.');
                    shouldUpdate = false;
                }
            }

            if (shouldUpdate) {
                setItems(freshItems);
                setCurrentPage(1);
            }

            setIsFromCache(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error fetching data';
            console.error(message, err);

            // Only show error if we don't have cached data
            if (cachedItems.length === 0) {
                setError(message);
                setItems([]);
            }
        } finally {
            setLoading(false);
        }
    }, [baseUrl, getAllCachedData, fetchPage]);

    // Load more (next page)
    const loadMore = useCallback(async () => {
        if (!baseUrl || loading) return;

        const nextPage = currentPage + 1;

        try {
            setLoading(true);
            setError(null);

            const newItems = await fetchPage(nextPage);

            setItems(prev => [...prev, ...newItems]);
            setCurrentPage(nextPage);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error loading more items';
            console.error(message, err);
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [baseUrl, loading, currentPage, fetchPage]);

    // Refresh from beginning
    const refresh = useCallback(async () => {
        setCurrentPage(1);
        setItems([]);
        await initialFetch();
    }, [initialFetch]);

    // Trigger fetch when URL or configuration changes
    useEffect(() => {
        // Reset state
        setItems([]);
        setCurrentPage(1);
        setLoading(true);
        setError(null);
        setIsFromCache(false);

        // Fetch
        initialFetch();
    }, [initialFetch]);

    return {
        items,
        loading,
        error,
        isFromCache,
        currentPage,
        loadMore,
        refresh,
    };
}

/**
 * Clear all paginated cache
 */
export function clearAllPaginatedCache(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_list_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
}
