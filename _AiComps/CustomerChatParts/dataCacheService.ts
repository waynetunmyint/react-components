import { BASE_URL, PAGE_ID, APP_NAME } from "@/config";

// Types for cached data
export interface CachedDataItem {
    Id?: number | string;
    Title?: string;
    Description?: string;
    Price?: number | string;
    Image?: string;
    ImgOne?: string;
    Link?: string;
    [key: string]: any;
}

export interface DataCache {
    [source: string]: CachedDataItem[];
}

export interface SearchResult {
    item: CachedDataItem;
    source: string;
    score: number;
    matchedFields: string[];
}

// Storage keys
const getCacheKey = () => `ChatDataCache_${PAGE_ID}`;
const getCacheTimestampKey = () => `ChatDataCacheTime_${PAGE_ID}`;
const getContextKey = () => `AiContext_${PAGE_ID}`;
const getSourcesKey = () => `ChatSources_${PAGE_ID}`;

// Cache expiry time (30 minutes)
const CACHE_EXPIRY_MS = 30 * 60 * 1000;

/**
 * Check if cache is still valid
 */
export function isCacheValid(): boolean {
    if (typeof window === 'undefined') return false;
    const timestamp = localStorage.getItem(getCacheTimestampKey());
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp) < CACHE_EXPIRY_MS;
}

/**
 * Get cached data from localStorage
 */
export function getCachedData(): DataCache | null {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem(getCacheKey());
        if (!cached) return null;
        return JSON.parse(cached);
    } catch (e) {
        console.error("Failed to parse cached data:", e);
        return null;
    }
}

/**
 * Save data to localStorage cache
 */
export function saveCachedData(data: DataCache): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(getCacheKey(), JSON.stringify(data));
        localStorage.setItem(getCacheTimestampKey(), Date.now().toString());
    } catch (e) {
        console.error("Failed to save cached data:", e);
    }
}

/**
 * Clear the data cache
 */
export function clearCache(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getCacheKey());
    localStorage.removeItem(getCacheTimestampKey());
    localStorage.removeItem(getContextKey());
    localStorage.removeItem(getSourcesKey());
}

/**
 * Calculate similarity score between query and text (fuzzy matching)
 * Optimized for both Latin and non-Latin (Myanmar) scripts
 */
function calculateSimilarity(query: string, text: string): number {
    if (!text || !query) return 0;

    const queryLower = query.toLowerCase().trim();
    const textLower = text.toLowerCase().trim();

    // Exact match
    if (textLower === queryLower) return 100;

    // Substring match (Crucial for scripts like Myanmar without spaces)
    if (textLower.includes(queryLower) || queryLower.includes(textLower)) {
        const overlapRatio = Math.min(queryLower.length, textLower.length) / Math.max(queryLower.length, textLower.length);
        return 70 + (overlapRatio * 25); // 70-95 based on how much of the string matches
    }

    // Check if it's likely a Latin script (has spaces/Latin chars)
    const isLatin = /^[A-Za-z0-9\s.,!?-]+$/.test(queryLower);

    if (isLatin) {
        // Word-by-word matching for English
        const queryWords = queryLower.split(/\s+/);
        const textWords = textLower.split(/\s+/);

        let matchedWords = 0;
        for (const qWord of queryWords) {
            if (qWord.length < 2) continue;
            for (const tWord of textWords) {
                if (tWord.includes(qWord) || qWord.includes(tWord)) {
                    matchedWords++;
                    break;
                }
            }
        }
        const wordScore = queryWords.length > 0 ? (matchedWords / queryWords.length) * 60 : 0;
        return wordScore;
    } else {
        // Character-based matching for Myanmar/other scripts
        let matches = 0;
        const shortStr = queryLower.length < textLower.length ? queryLower : textLower;
        const longStr = queryLower.length < textLower.length ? textLower : queryLower;

        for (let i = 0; i < shortStr.length; i++) {
            if (longStr.includes(shortStr[i])) matches++;
        }

        return (matches / shortStr.length) * 80;
    }
}

/**
 * Quick search for items by title match
 */
export function findItemsByTitle(title: string): SearchResult[] {
    const cache = getCachedData();
    if (!cache) return [];

    const results: SearchResult[] = [];
    const sources = Object.keys(cache);

    for (const source of sources) {
        const items = cache[source];
        if (!Array.isArray(items)) continue;

        for (const item of items) {
            const itemTitle = (item.Title || item.Name || "").toLowerCase();
            const searchTitle = title.toLowerCase().trim();

            if (itemTitle === searchTitle || itemTitle.includes(searchTitle) || searchTitle.includes(itemTitle)) {
                results.push({
                    item,
                    source,
                    score: 100,
                    matchedFields: ['Title']
                });
            }
        }
    }
    return results;
}

/**
 * Search through cached data
 */
export function searchCachedData(query: string, sources?: string[]): SearchResult[] {
    const cache = getCachedData();
    if (!cache) return [];

    const results: SearchResult[] = [];
    const searchFields = ['Title', 'Description', 'Name', 'Subtitle', 'Author', 'Category', 'Tags'];
    const minScore = 30; // Minimum score to include in results

    const sourcesToSearch = sources || Object.keys(cache);

    for (const source of sourcesToSearch) {
        const items = cache[source];
        if (!Array.isArray(items)) continue;

        for (const item of items) {
            let bestScore = 0;
            const matchedFields: string[] = [];

            for (const field of searchFields) {
                const value = item[field];
                if (typeof value === 'string') {
                    const score = calculateSimilarity(query, value);
                    if (score > bestScore) {
                        bestScore = score;
                    }
                    if (score >= minScore) {
                        matchedFields.push(field);
                    }
                }
            }

            if (bestScore >= minScore) {
                results.push({
                    item,
                    source,
                    score: bestScore,
                    matchedFields
                });
            }
        }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 10); // Return top 10 results
}

/**
 * Get items by source type
 */
export function getItemsBySource(source: string): CachedDataItem[] {
    const cache = getCachedData();
    if (!cache || !cache[source]) return [];
    return cache[source];
}

/**
 * Fetch and cache all data sources
 */
export async function fetchAndCacheData(): Promise<{
    dataCache: DataCache;
    context: string;
    sources: string[];
    contactInfo: any;
}> {
    const currentPageId = PAGE_ID as number;

    try {
        // 1. Fetch page config to get blocks
        const pageRes = await fetch(`${BASE_URL}/page/api/${currentPageId}`);
        const pageData = await pageRes.json();
        const actualData = Array.isArray(pageData) ? pageData[0] : pageData;

        let allSources: string[] = [];

        if (actualData?.ItemList) {
            const blocks = typeof actualData.ItemList === 'string'
                ? JSON.parse(actualData.ItemList)
                : actualData.ItemList;

            // Identify sources from blocks
            const blocksSources = [...new Set(blocks.map((b: any) => {
                const blockName = b.Block || "";
                const match = blockName.match(/^(Article|Brand|Product|Service|Course|Book|University|Project|Testimonial|Address|Advantage|Client|CustomSlider|Certificate|Page)/i);
                return match ? match[0].toLowerCase() : null;
            }))].filter(Boolean) as string[];

            // Core sources always included
            const coreSources = ["brand", "product", "service", "article", "book"];
            allSources = [...new Set([...blocksSources, ...coreSources])];
        } else {
            allSources = ["brand", "product", "service", "article"];
        }

        // 2. Fetch all data sources in parallel
        const sourcesToFetch = ["contactInfo", ...allSources];
        const fetchPromises = sourcesToFetch.map(src =>
            fetch(`${BASE_URL}/${src}/api/byPageId/${currentPageId}`)
                .then(async res => ({ src, ok: res.ok, data: res.ok ? await res.json() : null }))
                .catch(() => ({ src, ok: false, data: null }))
        );

        const results = await Promise.all(fetchPromises);

        // 3. Process results into cache and context
        const dataCache: DataCache = {};
        let contactInfo: any = null;
        let aggregatedContext = `--- OFFICIAL SYSTEM CONTEXT (System ID: ${currentPageId}) ---\n`;
        aggregatedContext += `Website Name: ${APP_NAME}\n`;

        results.forEach(({ src, ok, data }) => {
            if (!ok || !data) return;

            if (src === "contactInfo") {
                const c = Array.isArray(data) ? data[0] : data;
                if (c) {
                    contactInfo = c;
                    aggregatedContext += `\n[BUSINESS_PROFILE]\n`;
                    aggregatedContext += `Title: ${c.Title || APP_NAME}\n`;
                    if (c.Address) aggregatedContext += `Address: ${c.Address}\n`;
                    if (c.PhoneOne) aggregatedContext += `Phone: ${c.PhoneOne}\n`;
                    if (c.Email) aggregatedContext += `Email: ${c.Email}\n`;
                    if (c.OpenTime) aggregatedContext += `Opening Hours: ${c.OpenTime}\n`;
                    if (c.Description) aggregatedContext += `About: ${c.Description}\n`;
                }
            } else {
                const items = Array.isArray(data) ? data : [data];
                dataCache[src] = items;

                // Add to context (limited for AI token limits)
                const limitedItems = items.slice(0, 20).map((item: any) => ({
                    Id: item.Id,
                    Title: item.Title,
                    Description: item.Description?.substring(0, 100),
                    Price: item.Price,
                    Author: item.Author,
                    Category: item.Category
                }));
                aggregatedContext += `\n[DATASOURCE: ${src}]\n${JSON.stringify(limitedItems)}\n`;
            }
        });

        // 4. Save to localStorage
        saveCachedData(dataCache);
        if (typeof window !== 'undefined') {
            localStorage.setItem(getContextKey(), aggregatedContext);
            localStorage.setItem(getSourcesKey(), JSON.stringify(allSources));
        }

        console.log(`📦 Data cached for Page ${currentPageId}. Sources: ${allSources.join(', ')}`);

        return { dataCache, context: aggregatedContext, sources: allSources, contactInfo };
    } catch (e) {
        console.error("Failed to fetch and cache data:", e);
        return { dataCache: {}, context: "", sources: [], contactInfo: null };
    }
}

/**
 * Format search results for AI response
 */
export function formatSearchResultsForAI(results: SearchResult[], query: string): string {
    if (results.length === 0) {
        return `No items found matching "${query}". Please try a different search term.`;
    }

    const formatted = results.slice(0, 5).map((r, i) => {
        const item = r.item;
        return `${i + 1}. [${r.source.toUpperCase()}] ${item.Title || 'Untitled'}${item.Price ? ` - Price: ${item.Price}` : ''}${item.Description ? ` - ${item.Description.substring(0, 50)}...` : ''}`;
    }).join('\n');

    return `Found ${results.length} items matching "${query}":\n${formatted}`;
}

/**
 * Get or refresh cached data (with smart caching)
 */
export async function getOrRefreshCache(): Promise<DataCache> {
    if (isCacheValid()) {
        const cached = getCachedData();
        if (cached && Object.keys(cached).length > 0) {
            console.log("📦 Using valid cache");
            return cached;
        }
    }

    console.log("📦 Cache expired or empty, fetching fresh data...");
    const { dataCache } = await fetchAndCacheData();
    return dataCache;
}
