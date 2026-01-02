import { BASE_URL, PAGE_ID, FORCE_CLIENT_AI, APP_NAME, IMAGE_URL } from "@/config";
import { Message } from "./types";
import { searchCachedData, SearchResult } from "./dataCacheService";

export interface AiResponseResult {
    text: string | null;
    items?: any[];
    provider: string | null;
    answerId?: number; // ID of stored answer for feedback
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
export async function getAiResponse(updatedMessages: Message[], pageContext?: string, dataSource?: string): Promise<AiResponseResult> {
    try {
        console.log("🤖 [Frontend] Routing AI request to Backend Service...");

        const response = await fetch(`${BASE_URL}/ai/api/${PAGE_ID}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: updatedMessages,
                pageContext: pageContext,
                dataSource: dataSource
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

                // 🖼️ ENRICH ITEMS: Fetch missing images and ensure formatted links
                if (items && Array.isArray(items) && items.length > 0) {
                    console.log("🔍 [Frontend] Enriching AI items...");
                    const enrichedItems = await Promise.all(
                        items.map(async (item) => {
                            // Ensure proper link
                            const type = (item.type || item.Type || "").toLowerCase();
                            const id = item.id || item.Id || item.ID;
                            if (type && id && !item.link) {
                                item.link = `/${type}/view/${id}`;
                            }

                            // If image is missing or null, fetch from backend
                            if (!item.image && type && id) {
                                try {
                                    const apiUrl = `${BASE_URL}/${type}/api/${id}`;
                                    const res = await fetch(apiUrl);
                                    if (res.ok) {
                                        const fullData = await res.json();
                                        const actualData = Array.isArray(fullData) ? fullData[0] : fullData;
                                        const imageField = actualData?.Image || actualData?.ImgOne || actualData?.Thumbnail || actualData?.image;

                                        if (imageField) {
                                            item.image = imageField.startsWith('http') ? imageField : `${IMAGE_URL}/uploads/${imageField}`;
                                        }
                                    }
                                } catch (err) { }
                            }
                            return item;
                        })
                    );
                    items = enrichedItems;
                }

                return {
                    text: text,
                    items: items,
                    provider: data.provider,
                    answerId: data.answerId // Include for feedback tracking
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

/**
 * Send feedback (thumbs up/down) for an AI response
 */
export async function sendAiFeedback(answerId: number, isPositive: boolean): Promise<boolean> {
    try {
        console.log(`👍 [Feedback] Sending ${isPositive ? 'positive' : 'negative'} feedback for answer #${answerId}`);

        const response = await fetch(`${BASE_URL}/ai/api/${PAGE_ID}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answerId, isPositive })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ [Feedback] Submitted successfully`);
            return data.success === true;
        } else {
            console.error(`❌ [Feedback] Request failed:`, response.status);
            return false;
        }
    } catch (err) {
        console.error(`❌ [Feedback] Error:`, err);
        return false;
    }
}
