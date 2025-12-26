import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { BASE_URL, PAGE_ID, ENABLE_CHAT_AI, FORCE_CLIENT_AI, APP_NAME } from "../../../../config";
import { GetStoredJWT } from "../../StorageComps/StorageCompOne";
import { Message, AdminThread } from "./types";
import { getOrCreateGuestId, getStoredGuestInfo, saveToLocal, loadFromLocal } from "./chatUtils";
import { getAiResponse } from "./aiService";
import {
    fetchAndCacheData,
    searchCachedData,
    getCachedData,
    isCacheValid,
    getOrRefreshCache,
    SearchResult
} from "./dataCacheService";

// Constants
const POLLING_INTERVAL = 10000; // 10 seconds
const SCROLL_DELAY = 100;
const WAITING_MESSAGE_INTERVAL = 4000;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// Retry utility for failed API calls
const retryWithBackoff = async <T,>(
    fn: () => Promise<T>,
    retries = MAX_RETRY_ATTEMPTS,
    delay = RETRY_DELAY
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
};

export function useChatLogic(isOpen: boolean, onClose: () => void) {
    const currentPageId = PAGE_ID as number;
    const storedJWT = typeof window !== "undefined" ? localStorage.getItem("StoredJWT") : null;
    const isAdmin = !!storedJWT && typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

    // --- State ---
    const [guestId, setGuestId] = useState(getOrCreateGuestId());
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestCompany, setGuestCompany] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [recordId, setRecordId] = useState<number | null>(null);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "error">("connecting");
    const [adminThreads, setAdminThreads] = useState<AdminThread[]>([]);
    const [adminSelectedGuest, setAdminSelectedGuest] = useState<{ id: string, name: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [waitingMessageIndex, setWaitingMessageIndex] = useState(0);
    const [isAiEnabled, setIsAiEnabled] = useState(ENABLE_CHAT_AI);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [pageContext, setPageContext] = useState<string>("");
    const [activeSources, setActiveSources] = useState<string[]>([]);
    const [contactInfo, setContactInfo] = useState<any>(null);
    const [retryCount, setRetryCount] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback((smooth = true) => {
        if (!messagesEndRef.current) return;
        messagesEndRef.current.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "end"
        });
    }, []);

    const loadConversation = useCallback(async () => {
        if (!guestId && !isAdmin) {
            setIsLoading(false);
            return;
        }

        const targetId = isAdmin ? adminSelectedGuest?.id : guestId;
        if (isAdmin && !targetId) {
            try {
                setConnectionStatus("connecting");
                const res = await retryWithBackoff(() =>
                    fetch(`${BASE_URL}/customerChat/api/byPageId/${currentPageId}`)
                );
                if (!res.ok) throw new Error("Failed to fetch threads");
                const data = await res.json();
                const threads = Array.isArray(data) ? data : data.rows || [];
                setAdminThreads(threads.filter((t: any) => t.GuestId !== `AI_SETTINGS_${PAGE_ID}`));
                setConnectionStatus("connected");
                setRetryCount(0);
            } catch (err) {
                console.error("Failed to load admin threads:", err);
                setConnectionStatus("error");
                setRetryCount(prev => prev + 1);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        if (!targetId) {
            setIsLoading(false);
            return;
        }

        const localData = loadFromLocal(targetId);
        if (localData) {
            setMessages(Array.isArray(localData) ? localData : localData.messages || []);
        }

        try {
            setConnectionStatus("connecting");

            // 2. Fetch Global AI Settings
            const aiRes = await fetch(`${BASE_URL}/customerChat/api/byPageId/byGuest/${currentPageId}/AI_SETTINGS_${PAGE_ID}`);
            if (aiRes.ok) {
                const aiData = await aiRes.ok ? await aiRes.json() : null;
                const aiRecord = Array.isArray(aiData) ? aiData[0] : aiData;
                if (aiRecord) {
                    setIsAiEnabled(aiRecord.IsAIActive === "1" || aiRecord.IsAIActive === 1);
                }
            }

            // 3. Fetch Conversation with retry
            const res = await retryWithBackoff(() =>
                fetch(`${BASE_URL}/customerChat/api/byPageId/byGuest/${currentPageId}/${targetId}`)
            );
            if (!res.ok) throw new Error("Failed to fetch conversation");

            const data = await res.json();
            const record = Array.isArray(data) ? data[0] : data;

            if (record) {
                if (record.Id) setRecordId(record.Id);

                // Per-chat AI Toggle (from backend field IsAIActive)
                if (record.IsAIActive !== undefined && record.IsAIActive !== null) {
                    setIsAiEnabled(record.IsAIActive === "1" || record.IsAIActive === 1);
                }

                if (!isRegistered && !isAdmin && record.GuestName && record.GuestPhone) {
                    setGuestName(record.GuestName);
                    setGuestPhone(record.GuestPhone);
                    setGuestEmail(record.GuestEmail || "");
                    setGuestCompany(record.GuestCompany || "");
                    localStorage.setItem(`StoredGuestName_${PAGE_ID}`, record.GuestName);
                    localStorage.setItem(`StoredGuestPhone_${PAGE_ID}`, record.GuestPhone);
                    if (record.GuestEmail) localStorage.setItem(`StoredGuestEmail_${PAGE_ID}`, record.GuestEmail);
                    if (record.GuestCompany) localStorage.setItem(`StoredGuestCompany_${PAGE_ID}`, record.GuestCompany);
                    setIsRegistered(true);
                }

                if (record.ItemList) {
                    const parsed = typeof record.ItemList === 'string' ? JSON.parse(record.ItemList) : record.ItemList;
                    const backendMessages = Array.isArray(parsed) ? parsed : (parsed.messages || []);
                    if (backendMessages.length >= messages.length) {
                        setMessages(backendMessages);
                        saveToLocal(targetId, parsed);
                    }
                }
            }
            setConnectionStatus("connected");
            setRetryCount(0);
        } catch (err) {
            console.error("Failed to load conversation:", err);
            setConnectionStatus("error");
            setRetryCount(prev => prev + 1);
        } finally {
            setIsLoading(false);
        }
    }, [guestId, currentPageId, isRegistered, isAdmin, adminSelectedGuest, messages.length]);

    const sendMessage = async (overrideText?: string) => {
        const targetId = isAdmin ? adminSelectedGuest?.id : guestId;
        const targetName = isAdmin ? adminSelectedGuest?.name : guestName;

        const text = (overrideText || inputMessage).trim();
        if (!text || isSending || (!isRegistered && !isAdmin) || !targetId) return;

        setInputMessage("");
        setIsSending(true);

        const newMessage: Message = {
            id: Date.now(),
            text: text,
            sender: isAdmin ? 'page' : 'guest',
            time: new Date().toISOString()
        };

        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        saveToLocal(targetId, updatedMessages);

        let currentRecordId = recordId;

        try {
            const formData = new FormData();
            formData.append("guestId", targetId);
            formData.append("pageId", currentPageId.toString());
            formData.append("guestName", targetName || "Guest");
            formData.append("guestPhone", guestPhone || "");
            formData.append("guestEmail", guestEmail || "");
            formData.append("guestCompany", guestCompany || "");
            formData.append("itemList", JSON.stringify(updatedMessages));

            if (recordId) formData.append("id", recordId.toString());

            const res = await fetch(`${BASE_URL}/customerChat/api`, {
                method: recordId ? "PATCH" : "POST",
                body: formData,
                headers: storedJWT ? { Authorization: `Bearer ${storedJWT}` } : {}
            });

            if (res.ok) {
                const responseData = await res.json();
                currentRecordId = recordId || responseData?.Id || responseData?.id;
                if (!recordId && currentRecordId) setRecordId(currentRecordId);
            }
        } catch (err) { console.warn("Backend sync failed"); }

        if (!isAdmin && isAiEnabled) {
            setIsAiThinking(true);

            // Ensure context is loaded (should be pre-loaded, but fallback here)
            let latestContext = pageContext;
            if (!latestContext && typeof window !== 'undefined') {
                latestContext = localStorage.getItem(`AiContext_${currentPageId}`) || "";
            }

            const aiRes = await getAiResponse(updatedMessages, latestContext);
            if (aiRes.text) {
                const aiMessage: Message = {
                    id: Date.now() + 1,
                    text: aiRes.text,
                    sender: 'page',
                    time: new Date().toISOString(),
                    items: aiRes.items
                };
                const finalMessages = [...updatedMessages, aiMessage];
                setMessages(finalMessages);
                saveToLocal(targetId, finalMessages);

                try {
                    const aiFormData = new FormData();
                    aiFormData.append("guestId", targetId);
                    aiFormData.append("pageId", currentPageId.toString());
                    aiFormData.append("guestName", targetName || "Guest");
                    aiFormData.append("itemList", JSON.stringify(finalMessages));
                    if (currentRecordId) aiFormData.append("id", currentRecordId.toString());
                    await fetch(`${BASE_URL}/customerChat/api`, { method: "PATCH", body: aiFormData });
                } catch (e) { }
            }
            setIsAiThinking(false);
        }
        setIsSending(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName.trim() || !guestPhone.trim()) return;

        localStorage.setItem(`StoredGuestName_${PAGE_ID}`, guestName);
        localStorage.setItem(`StoredGuestPhone_${PAGE_ID}`, guestPhone);
        if (guestEmail) localStorage.setItem(`StoredGuestEmail_${PAGE_ID}`, guestEmail);
        if (guestCompany) localStorage.setItem(`StoredGuestCompany_${PAGE_ID}`, guestCompany);

        setIsRegistered(true);
        try {
            const formData = new FormData();
            formData.append("guestId", guestId);
            formData.append("pageId", currentPageId.toString());
            formData.append("guestName", guestName);
            formData.append("guestPhone", guestPhone);
            formData.append("guestEmail", guestEmail || "");
            formData.append("guestCompany", guestCompany || "");
            formData.append("itemList", "[]");
            formData.append("init", "true");

            await fetch(`${BASE_URL}/customerChat/api`, {
                method: "POST",
                body: formData
            });
            loadConversation();
        } catch (e) { }
    };

    const deleteMessage = async (messageId: string | number) => {
        if (!recordId) return;
        if (!window.confirm("Delete this message?")) return;
        const updatedMessages = messages.filter(m => m.id !== messageId);
        setMessages(updatedMessages);
        saveToLocal(isAdmin ? adminSelectedGuest?.id! : guestId, updatedMessages);
        try {
            const formData = new FormData();
            formData.append("id", recordId.toString());
            formData.append("itemList", JSON.stringify(updatedMessages));
            await fetch(`${BASE_URL}/customerChat/api`, { method: "PATCH", body: formData });
        } catch (e) { }
    };

    const handleDeleteRecord = async (specificId?: number) => {
        const idToDelete = specificId || recordId;
        if (!isAdmin || !idToDelete) return;
        if (!window.confirm("Delete entire chat?")) return;
        try {
            const formData = new FormData();
            formData.append("id", idToDelete.toString());
            await fetch(`${BASE_URL}/customerChat/api`, { method: "DELETE", body: formData });
            if (!specificId || specificId === recordId) {
                setAdminSelectedGuest(null);
                setMessages([]);
                setRecordId(null);
            }
            loadConversation();
        } catch (e) { }
    };

    const handleEndChat = () => {
        if (window.confirm("End session?")) {
            localStorage.removeItem(`StoredGuestName_${PAGE_ID}`);
            localStorage.removeItem(`StoredGuestPhone_${PAGE_ID}`);
            localStorage.removeItem(`StoredGuestEmail_${PAGE_ID}`);
            localStorage.removeItem(`PersistentGuestId_${PAGE_ID}`);
            setIsRegistered(false);
            setGuestId("");
            setGuestName("");
            setMessages([]);
            setRecordId(null);
            onClose();
        }
    };

    const handleToggleAi = async () => {
        const targetGuestId = isAdmin ? adminSelectedGuest?.id : guestId;
        const isPerChat = isAdmin && !!adminSelectedGuest;
        const newValue = !isAiEnabled;
        setIsAiEnabled(newValue);

        if (isPerChat && targetGuestId && recordId) {
            // Toggle for THIS SPECIFIC CONVERSATION
            try {
                const formData = new FormData();
                formData.append("id", recordId.toString());
                formData.append("IsAIActive", newValue ? "1" : "0");
                await fetch(`${BASE_URL}/customerChat/api`, {
                    method: "PATCH",
                    body: formData,
                    headers: storedJWT ? { Authorization: `Bearer ${storedJWT}` } : {}
                });
            } catch (err) { console.error("Per-chat AI toggle failed", err); }
            return;
        }

        // Global Toggle logic (if no specific guest selected or if guest-side)
        try {
            const formData = new FormData();
            formData.append("guestId", `AI_SETTINGS_${PAGE_ID}`);
            formData.append("pageId", currentPageId.toString());
            formData.append("guestName", "SYSTEM_AI_SETTINGS");
            formData.append("itemList", JSON.stringify({ isAiEnabled: newValue }));
            formData.append("IsAIActive", newValue ? "1" : "0");

            const checkRes = await fetch(`${BASE_URL}/customerChat/api/byPageId/byGuest/${currentPageId}/AI_SETTINGS_${PAGE_ID}`);
            const checkData = await checkRes.json();
            const existing = Array.isArray(checkData) ? checkData[0] : (checkData.rows ? checkData.rows[0] : checkData);
            const existingId = existing?.Id || existing?.id;

            if (existingId) formData.append("id", existingId.toString());

            await fetch(`${BASE_URL}/customerChat/api`, {
                method: existingId ? "PATCH" : "POST",
                body: formData,
                headers: storedJWT ? { Authorization: `Bearer ${storedJWT}` } : {}
            });
        } catch (err) { console.error("Global AI toggle sync failed", err); }
    };

    const waitingMessages = useMemo(() => [
        "Connecting to a support agent...",
        "We're reviewing your message!",
        "Almost there, stay with us...",
        "One of our experts is picking this up.",
        "Hang tight, help is on the way!"
    ], []);

    useEffect(() => {
        if (!isOpen || isAdmin || messages.length === 0 || messages[messages.length - 1].sender === 'page') {
            setWaitingMessageIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setWaitingMessageIndex(prev => (prev + 1) % waitingMessages.length);
        }, WAITING_MESSAGE_INTERVAL);

        return () => clearInterval(interval);
    }, [isOpen, isAdmin, messages, waitingMessages.length]);

    useEffect(() => {
        if (isOpen) {
            const info = getStoredGuestInfo();
            setGuestName(info.name);
            setGuestPhone(info.phone);
            setGuestEmail(info.email);
            setGuestCompany(info.company);
            setIsRegistered(!!(info.name && info.phone));
            setGuestId(getOrCreateGuestId());
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const refreshContext = async () => {
            const contextKey = `AiContext_${currentPageId}`;
            const sourcesKey = `ChatSources_${currentPageId}`;

            // 1. Try Loading from Cache first (quick load)
            if (typeof window !== 'undefined') {
                const cachedCtx = localStorage.getItem(contextKey);
                const cachedSrc = localStorage.getItem(sourcesKey);
                if (cachedCtx) setPageContext(cachedCtx);
                if (cachedSrc) setActiveSources(JSON.parse(cachedSrc));

                // Check if cache is still valid
                if (isCacheValid() && cachedCtx && cachedSrc) {
                    console.log("📦 Chat: Using valid cached context/sources...");
                    return; // Don't refetch if cache is valid
                }
            }

            // 2. Fetch fresh data using the cache service
            try {
                console.log("📦 Chat: Fetching fresh data and caching...");
                const { context, sources, contactInfo: fetchedContact } = await fetchAndCacheData();

                if (context) {
                    setPageContext(context);
                }
                if (sources && sources.length > 0) {
                    setActiveSources(sources);
                }
                if (fetchedContact) {
                    setContactInfo(fetchedContact);
                }

                console.log(`📦 Data cached successfully. Sources: ${sources.join(', ')}`);
            } catch (e) {
                console.warn("Chat: Failed to refresh context, using cached data if available", e);
            }
        };

        refreshContext();
        loadConversation();

        // Clear any existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Set up new polling interval
        pollingIntervalRef.current = setInterval(loadConversation, POLLING_INTERVAL);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [isOpen, loadConversation, currentPageId]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom(false);
            const timer = setTimeout(() => scrollToBottom(true), SCROLL_DELAY);
            return () => clearTimeout(timer);
        }
    }, [isOpen, messages.length, isAiThinking, adminSelectedGuest, scrollToBottom]);

    // Search function that queries cached data
    const searchLocalData = useCallback((query: string, sources?: string[]) => {
        return searchCachedData(query, sources);
    }, []);

    // Get all cached data
    const getCachedDataLocal = useCallback(() => {
        return getCachedData();
    }, []);

    return {
        isAdmin, isRegistered, messages, recordId, inputMessage, setInputMessage,
        isLoading, isSending, adminThreads, adminSelectedGuest, setAdminSelectedGuest,
        searchQuery, setSearchQuery, waitingMessageIndex, isAiEnabled, isAiThinking,
        guestName, setGuestName, guestPhone, setGuestPhone, guestEmail, setGuestEmail,
        guestCompany, setGuestCompany,
        handleRegister, sendMessage, deleteMessage, handleDeleteRecord, handleEndChat,
        messagesEndRef, scrollToBottom, handleToggleAi, waitingMessages,
        activeSources, contactInfo, connectionStatus, retryCount,
        searchLocalData, getCachedDataLocal
    };
}
