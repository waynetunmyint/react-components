import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface UseCachedFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    isFromCache: boolean;
    refetch: () => Promise<void>;
}

interface UseCachedFetchOptions {
    /** Cache expiration time in milliseconds. Default: 5 minutes */
    cacheTime?: number;
    /** Whether to skip cache and always fetch fresh data */
    skipCache?: boolean;
}

/**
 * Custom hook that implements "stale-while-revalidate" pattern:
 * 1. Shows cached data instantly from localStorage (no loading spinner)
 * 2. Fetches fresh data in background
 * 3. Updates automatically when new data arrives
 */
export function useCachedFetch<T = any>(
    url: string | null,
    options: UseCachedFetchOptions = {}
): UseCachedFetchResult<T> {
    const { cacheTime = 5 * 60 * 1000, skipCache = false } = options; // Default 5 min cache

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFromCache, setIsFromCache] = useState(false);

    // Generate cache key from URL
    const getCacheKey = useCallback((fetchUrl: string) => {
        return `cache_${btoa(fetchUrl).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
    }, []);

    // Get cached data from localStorage
    const getCachedData = useCallback((fetchUrl: string): T | null => {
        if (skipCache) return null;

        try {
            const key = getCacheKey(fetchUrl);
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const entry: CacheEntry<T> = JSON.parse(cached);

            // Check if cache is still valid
            const isExpired = Date.now() - entry.timestamp > cacheTime;

            // Return data even if expired (stale-while-revalidate)
            // We'll fetch fresh data in background
            return entry.data;
        } catch {
            return null;
        }
    }, [getCacheKey, cacheTime, skipCache]);

    // Save data to localStorage cache
    const setCachedData = useCallback((fetchUrl: string, newData: T) => {
        try {
            const key = getCacheKey(fetchUrl);
            const entry: CacheEntry<T> = {
                data: newData,
                timestamp: Date.now(),
            };
            localStorage.setItem(key, JSON.stringify(entry));
        } catch (err) {
            // localStorage might be full or disabled
            console.warn('Failed to cache data:', err);
        }
    }, [getCacheKey]);

    // Fetch data from API
    const fetchData = useCallback(async () => {
        if (!url) {
            setError('No URL provided');
            setLoading(false);
            return;
        }

        try {
            // First, try to show cached data immediately
            const cachedData = getCachedData(url);
            if (cachedData !== null) {
                setData(cachedData);
                setIsFromCache(true);
                setLoading(false); // Stop loading - we have cached data to show
            }

            // Always fetch fresh data in background (revalidate)
            setError(null);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const result = await response.json();

            // Normalize response
            let resolved: any = null;
            if (!result) resolved = null;
            else if (Array.isArray(result)) resolved = result[0] ?? null;
            else if (result?.data && !Array.isArray(result?.data)) resolved = result.data;
            else if (result?.item && !Array.isArray(result?.item)) resolved = result.item;
            else resolved = result;

            // Smart update: Only replace if data changed
            const isIdentical = JSON.stringify(resolved) === JSON.stringify(data);

            if (!isIdentical) {
                // Update state with fresh data
                setData(resolved);

                // Save to cache for next time
                if (resolved !== null) {
                    setCachedData(url, resolved);
                }
            }

            setIsFromCache(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error fetching data';
            console.error(message, err);

            // Only show error if we don't have cached data
            if (data === null) {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }, [url, getCachedData, setCachedData, data]);

    // Initial fetch
    useEffect(() => {
        setLoading(true);
        setError(null);
        setIsFromCache(false);
        fetchData();
    }, [url]); // Note: fetchData is not in deps to avoid infinite loop

    return {
        data,
        loading,
        error,
        isFromCache,
        refetch: fetchData,
    };
}

/**
 * Clear all cached data
 */
export function clearAllCache(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Clear cache for a specific URL
 */
export function clearCacheForUrl(url: string): void {
    const key = `cache_${btoa(url).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
    localStorage.removeItem(key);
}
