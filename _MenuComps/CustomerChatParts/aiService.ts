import { BASE_URL, PAGE_ID, FORCE_CLIENT_AI, APP_NAME, IMAGE_URL } from "../../../../config";
import { Message } from "./types";
import { searchCachedData, SearchResult } from "./dataCacheService";

export interface AiResponseResult {
    text: string | null;
    items?: any[];
    provider: string | null;
}

/**
 * Search local cache for relevant items (still useful for pre-filtering or extra context)
 */
function getRelevantItemsFromCache(query: string): string {
    const results = searchCachedData(query);
    if (results.length === 0) return "";

    const formattedItems = results.slice(0, 5).map((r: SearchResult) => {
        const item = r.item;
        return {
            Id: item.Id,
            Title: item.Title,
            Description: item.Description?.substring(0, 100),
            Price: item.Price,
            Image: item.Image || item.ImgOne,
            Author: item.Author,
            Type: r.source,
            Link: `/${r.source}/view/${item.Id}`
        };
    });

    return `\n[SEARCH_RESULTS for "${query}"]\n${JSON.stringify(formattedItems)}\n`;
}

/**
 * Main function to get AI response - now routes EXCLUSIVELY to Backend API
 * Direct browser calls to AI providers are blocked by CORS policies.
 */
export async function getAiResponse(updatedMessages: Message[], pageContext?: string): Promise<AiResponseResult> {
    try {
        console.log("🤖 [Frontend] Routing AI request to Backend Service...");

        const response = await fetch(`${BASE_URL}/customerChat/api/ai/${PAGE_ID}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: updatedMessages,
                pageContext: pageContext
            })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log(`🤖 [Backend AI] Success via ${data.provider}`);

                let text = data.text;
                let items = data.items;

                // Robust check: if text is a JSON string containing items, parse it
                if (text && (text.trim().startsWith('{') || text.trim().startsWith('```json'))) {
                    try {
                        const cleanText = text.replace(/```json|```/g, '').trim();
                        const parsed = JSON.parse(cleanText);
                        if (parsed.text) text = parsed.text;
                        if (parsed.items) items = parsed.items;
                    } catch (e) {
                        console.warn("Found JSON-like text but failed to parse:", e);
                    }
                }

                // 🖼️ ENRICH ITEMS: Fetch missing images from backend
                if (items && Array.isArray(items) && items.length > 0) {
                    console.log("🔍 [Frontend] Checking for missing images...");
                    const enrichedItems = await Promise.all(
                        items.map(async (item) => {
                            // If image is missing or null, fetch from backend
                            if (!item.image && item.type && item.id) {
                                try {
                                    const apiUrl = `${BASE_URL}/${item.type}/api/${item.id}`;
                                    console.log(`📡 [Frontend] Fetching image for ${item.type} #${item.id}`);
                                    const res = await fetch(apiUrl);
                                    if (res.ok) {
                                        const fullData = await res.json();
                                        const actualData = Array.isArray(fullData) ? fullData[0] : fullData;

                                        // Get image from various possible fields
                                        const imageField = actualData?.Image || actualData?.ImgOne ||
                                            actualData?.Thumbnail || actualData?.image;

                                        if (imageField) {
                                            // Format image URL
                                            const fullImageUrl = imageField.startsWith('http')
                                                ? imageField
                                                : `${IMAGE_URL}/uploads/${imageField}`;

                                            console.log(`✅ [Frontend] Found image for ${item.type} #${item.id}: ${imageField}`);
                                            return { ...item, image: fullImageUrl };
                                        }
                                    }
                                } catch (err) {
                                    console.warn(`⚠️ [Frontend] Failed to fetch image for ${item.type} #${item.id}:`, err);
                                }
                            }
                            return item;
                        })
                    );
                    items = enrichedItems;
                }

                return {
                    text: text,
                    items: items,
                    provider: data.provider
                };
            } else {
                console.error("🤖 [Backend AI] Service error:", data.error);
            }
        } else {
            console.warn("🤖 [Backend AI] Request failed, status:", response.status);
        }
    } catch (err) {
        console.error("🤖 [Backend AI] Connection error (Check CORS or network):", err);
    }

    return { text: null, provider: null };
}
