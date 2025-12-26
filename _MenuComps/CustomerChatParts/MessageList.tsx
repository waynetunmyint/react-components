import React, { memo, useState, useCallback } from "react";
import { Loader2, MessageCircle, Trash2, Sparkles, ImageOff } from "lucide-react";
import { Message } from "./types";
import { ExternalLink } from "lucide-react";
import { getPlatform } from "./chatUtils";
import { IMAGE_URL } from "../../../../config";
import { formatPrice } from "../../HelperComps/TextCaseComp";

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    isAdmin: boolean;
    onDeleteMessage: (id: string | number) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    waitingMessages: string[];
    waitingMessageIndex: number;
    isAiThinking?: boolean;
}

// Loading Image Component with skeleton and error states
const LoadingImage = memo(function LoadingImage({
    src,
    alt,
    className = ""
}: {
    src?: string;
    alt?: string;
    className?: string;
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
        setHasError(false);
    }, []);

    const handleError = useCallback(() => {
        setIsLoading(false);
        setHasError(true);
    }, []);

    if (!src) return null;

    return (
        <div className="relative w-full h-full">
            {/* Skeleton Loading Animation */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-text-secondary)]/20 via-[var(--theme-text-secondary)]/30 to-[var(--theme-text-secondary)]/20 animate-shimmer bg-[length:200%_100%]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-[var(--theme-text-muted)] animate-spin" />
                    </div>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 bg-[var(--theme-secondary-bg)] flex flex-col items-center justify-center gap-1">
                    <ImageOff className="w-6 h-6 text-[var(--theme-text-muted)]" />
                    <span className="text-[8px] text-[var(--theme-text-muted)] uppercase tracking-wider">No Image</span>
                </div>
            )}

            {/* Actual Image */}
            {!hasError && (
                <img
                    src={src}
                    alt={alt || ""}
                    className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onLoad={handleLoad}
                    onError={handleError}
                    loading="lazy"
                />
            )}
        </div>
    );
});

const MessageList = memo(function MessageList({
    messages,
    isLoading,
    isAdmin,
    onDeleteMessage,
    messagesEndRef,
    waitingMessages,
    waitingMessageIndex,
    isAiThinking
}: MessageListProps) {
    const platform = getPlatform();

    // Improved image URL resolver
    const resolveImg = useCallback((src?: any): string | undefined => {
        if (!src || typeof src !== 'string') return undefined;

        const cleanSrc = src.trim();
        if (!cleanSrc) return undefined;

        // 1. Full URL matching
        if (cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://')) {
            return cleanSrc;
        }

        // 2. Protocol relative
        if (cleanSrc.startsWith('//')) {
            return `https:${cleanSrc}`;
        }

        // 3. Handle path formats
        const pathOnly = cleanSrc.replace(/^\/+/, ''); // Remove leading slashes

        // 4. Check if it already has 'uploads/' prefix
        if (pathOnly.startsWith('uploads/')) {
            return `${IMAGE_URL}/${pathOnly}`;
        }

        // 5. Default: add uploads prefix
        return `${IMAGE_URL}/uploads/${pathOnly}`;
    }, []);

    const getOptimalLink = (item: { link?: string; links?: { web?: string; android?: string; ios?: string } }) => {
        if (item.links) {
            return item.links[platform as keyof typeof item.links] || item.links.web || item.link;
        }
        return item.link;
    };

    return (
        <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 scrollbar-hide"
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
            aria-atomic="false"
        >
            {isLoading ? (
                <div
                    className="flex flex-col items-center justify-center h-full gap-3 text-[var(--theme-text-muted)]"
                    role="status"
                    aria-label="Loading chat"
                >
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-[11px] font-medium animate-pulse">Initializing Secure Chat...</span>
                </div>
            ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-10 gap-4">
                    <div className="w-16 h-16 bg-[var(--theme-text-secondary)]/10 rounded-2xl flex items-center justify-center text-[var(--theme-text-muted)] border border-[var(--theme-text-secondary)]/20 shadow-inner">
                        <MessageCircle size={32} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-[var(--theme-text-primary)] mb-2">How can we help?</h4>
                        <p className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed">Send a message and we'll get back to you across any page you visit!</p>
                    </div>
                </div>
            ) : (
                messages.map((msg, i) => {
                    const isMyMessage = msg.sender === (isAdmin ? 'page' : 'guest');
                    const hasItems = msg.items && msg.items.length > 0;

                    return (
                        <div key={i} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} space-y-2 animate-messageIn group/msg w-full`}>
                            {/* 1. Main Text Bubble */}
                            {msg.text && (
                                <div
                                    className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-300 ${isMyMessage
                                        ? 'rounded-tr-sm bg-[var(--theme-accent)] text-[var(--theme-primary-text)]'
                                        : 'rounded-tl-sm bg-[var(--theme-text-secondary)]/20 border border-[var(--theme-text-primary)]/5 text-[var(--theme-text-primary)]'
                                        }`}
                                >
                                    <p className="text-[12px] leading-relaxed break-words whitespace-pre-wrap">
                                        {msg.text}
                                    </p>

                                    {/* Meta info inside text bubble if no items */}
                                    {!hasItems && (
                                        <div className="flex items-center gap-2 mt-1 px-0.5 opacity-60">
                                            <span className="text-[8px]">
                                                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {!isAdmin && msg.sender === 'page' && (
                                                <span className="text-[7px] font-black uppercase tracking-widest text-[var(--theme-accent)]">AI</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 2. Rich Content: Single Image (legacy support) */}
                            {msg.image && !hasItems && (
                                <div className="w-[200px] aspect-video rounded-2xl overflow-hidden shadow-lg border border-[var(--theme-text-primary)]/5 bg-[var(--theme-text-secondary)]/20">
                                    <LoadingImage
                                        src={resolveImg(msg.image)}
                                        alt={msg.title || "Message image"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* 3. Vertical List View (Articles/Updates) */}
                            {hasItems && msg.displayType === 'list' && (
                                <div className="flex flex-col gap-2 w-full max-w-[95%] py-1">
                                    {msg.items?.map((item, idx) => {
                                        const itemLink = getOptimalLink(item);
                                        const imgUrl = resolveImg((item as any).Thumbnail || item.image || item.thumbnail || (item as any).Image || (item as any).ImgOne);
                                        return (
                                            <div key={idx}
                                                className="flex gap-3 bg-[var(--theme-text-secondary)]/20 rounded-xl p-2.5 border border-[var(--theme-text-secondary)]/30 hover:bg-[var(--theme-text-secondary)]/30 hover:border-[var(--theme-text-secondary)]/40 transition-all cursor-pointer group/listItem"
                                                onClick={() => {
                                                    if (itemLink) {
                                                        if (itemLink.startsWith('/')) window.location.href = itemLink;
                                                        else window.open(itemLink, '_blank');
                                                    }
                                                }}
                                            >
                                                <div className="w-14 h-14 flex-none rounded-lg overflow-hidden bg-[var(--theme-secondary-bg)] border border-[var(--theme-text-primary)]/5">
                                                    <LoadingImage
                                                        src={imgUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover/listItem:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0 justify-center">
                                                    <h5 className="text-[12px] font-bold text-[var(--theme-text-primary)] line-clamp-2 leading-tight group-hover/listItem:text-[var(--theme-accent)] transition-colors">
                                                        {item.title}
                                                    </h5>
                                                    {(item.author || (item as any).Author) && (
                                                        <p className="text-[10px] text-[var(--theme-text-muted)] line-clamp-1 italic mt-0.5">
                                                            {item.author || (item as any).Author}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* 4. Horizontal Carousel (Products/Books) - Default */}
                            {hasItems && (!msg.displayType || msg.displayType === 'carousel') && (
                                <div className="relative w-full max-w-full group/carousel py-1">
                                    {(() => { console.log("🎡 Carousel Items Content:", msg.items); return null; })()}
                                    <div
                                        id={`carousel-${i}`}
                                        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x scroll-smooth px-0"
                                    >
                                        {msg.items?.map((item, idx) => {
                                            const itemLink = getOptimalLink(item);
                                            const priceVal = item.price;

                                            return (
                                                <div key={idx} className="snap-start flex-none w-[180px] sm:w-[200px] relative flex flex-col bg-[var(--theme-text-secondary)]/20 backdrop-blur-md rounded-2xl overflow-hidden border border-[var(--theme-text-primary)]/10 hover:border-[var(--theme-accent)]/50 hover:bg-[var(--theme-text-secondary)]/30 transition-all duration-300 cursor-pointer shadow-xl"
                                                    onClick={() => {
                                                        if (itemLink) {
                                                            if (itemLink.startsWith('/')) {
                                                                window.location.href = itemLink;
                                                            } else {
                                                                window.open(itemLink, '_blank');
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {/* Item Image */}
                                                    <div className="w-full aspect-[4/3] overflow-hidden bg-[var(--theme-secondary-bg)]/50">
                                                        <LoadingImage
                                                            src={resolveImg((item as any).Thumbnail || item.image || item.thumbnail || (item as any).Image || (item as any).ImgOne || (item as any).imgOne)}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    </div>

                                                    <div className="p-3 flex flex-col flex-1">
                                                        <h5 className="text-[12px] font-bold text-[var(--theme-text-primary)] line-clamp-2 leading-tight mb-1">
                                                            {item.title}
                                                        </h5>
                                                        {(item.author || (item as any).Author) && (
                                                            <p className="text-[10px] text-[var(--theme-accent)] mb-1 font-medium italic opacity-80">
                                                                {item.author || (item as any).Author}
                                                            </p>
                                                        )}

                                                        {priceVal && (
                                                            <p className="text-[11px] font-black text-[var(--scolor)] mb-2">
                                                                {formatPrice(priceVal)} K
                                                            </p>
                                                        )}

                                                        {item.description && (
                                                            <p className="text-[10px] text-[var(--theme-text-muted)] line-clamp-3 leading-relaxed mb-3 flex-1">
                                                                {item.description}
                                                            </p>
                                                        )}

                                                        <div className="mt-auto px-3 py-1.5 rounded-xl text-[10px] font-black text-center bg-[var(--theme-text-primary)]/5 border border-[var(--theme-text-primary)]/5 hover:bg-[var(--theme-accent)] hover:text-[var(--theme-primary-text)] transition-all duration-300">
                                                            View Details
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Carousel Nav Buttons */}
                                    <button
                                        onClick={() => document.getElementById(`carousel-${i}`)?.scrollBy({ left: -220, behavior: 'smooth' })}
                                        className="absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--theme-secondary-bg)]/90 backdrop-blur-md border border-[var(--theme-text-primary)]/10 rounded-full shadow-2xl flex items-center justify-center text-[var(--theme-text-primary)] hover:bg-[var(--theme-text-secondary)] opacity-0 group-hover/carousel:opacity-100 transition-all hidden sm:flex z-10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button
                                        onClick={() => document.getElementById(`carousel-${i}`)?.scrollBy({ left: 220, behavior: 'smooth' })}
                                        className="absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--theme-secondary-bg)]/90 backdrop-blur-md border border-[var(--theme-text-primary)]/10 rounded-full shadow-2xl flex items-center justify-center text-[var(--theme-text-primary)] hover:bg-[var(--theme-text-secondary)] opacity-0 group-hover/carousel:opacity-100 transition-all hidden sm:flex z-10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}

                            {/* Meta info below items if items exist */}
                            {hasItems && (
                                <div className="flex items-center gap-2 px-1 opacity-50">
                                    <span className="text-[8px]">
                                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {!isAdmin && msg.sender === 'page' && (
                                        <span className="text-[7px] font-black uppercase tracking-widest text-blue-400">AI Assistant</span>
                                    )}
                                    {(isAdmin || msg.sender === 'guest') && (
                                        <button
                                            onClick={() => onDeleteMessage(msg.id)}
                                            className="opacity-0 group-hover/msg:opacity-100 p-1 hover:bg-[var(--theme-text-primary)]/10 rounded transition-all text-[var(--theme-text-primary)]/50"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* Engagement / Typing / Thinking Indicator */}
            {!isAdmin && messages.length > 0 && messages[messages.length - 1].sender === 'guest' && !isLoading && (
                <div className="flex flex-col gap-3 animate-fadeIn mt-2">
                    <div className="flex justify-start">
                        <div className={`px-4 py-3 rounded-3xl rounded-bl-sm flex items-center gap-3 shadow-lg border transition-colors duration-500 ${isAiThinking ? 'border-[var(--theme-border-accent)]/50 shadow-[0_0_15px_-3px_rgba(var(--theme-primary-bg-rgb),0.3)]' : 'bg-[var(--theme-text-secondary)]/10 border-[var(--theme-text-secondary)]/20'}`} style={{
                            backgroundColor: isAiThinking ? 'rgba(var(--theme-primary-bg-rgb), 0.15)' : undefined
                        }}>
                            {isAiThinking ? (
                                <>
                                    <div className="relative w-5 h-5 flex items-center justify-center">
                                        <Sparkles size={18} className="animate-spin absolute" style={{ animationDuration: '3s', color: 'var(--theme-accent)' }} />
                                        <div className="w-1.5 h-1.5 rounded-full animate-ping absolute" style={{ backgroundColor: 'var(--theme-accent)' }} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse" style={{ color: 'var(--theme-accent)' }}>
                                        AI is Thinking...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <div className="flex gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ backgroundColor: 'var(--theme-text-muted)' }} />
                                        <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ backgroundColor: 'var(--theme-text-muted)', opacity: 0.7 }} />
                                        <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--theme-text-muted)', opacity: 0.4 }} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-muted)]">
                                        Support is reviewing
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {!isAiThinking && (
                        <div className="flex items-center gap-2 px-2 py-1 rounded-xl border w-fit self-center animate-pulse" style={{
                            backgroundColor: 'rgba(var(--theme-primary-bg-rgb), 0.05)',
                            borderColor: 'rgba(var(--theme-primary-bg-rgb), 0.1)'
                        }}>
                            <Sparkles size={12} style={{ color: 'var(--theme-primary-bg)' }} />
                            <span className="text-[10px] font-medium italic" style={{ color: 'var(--theme-primary-bg)' }}>
                                {waitingMessages[waitingMessageIndex]}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
});

export default MessageList;
