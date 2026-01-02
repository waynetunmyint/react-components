import React, { useState, useEffect, memo, useMemo } from "react";
import {
    Sparkles, HelpCircle, Loader2, Globe, ArrowLeft
} from "lucide-react";
import { ENABLE_CUSTOMER_CHAT, BASE_URL, PAGE_ID } from "@/config";

type Language = "mm" | "en";

const LABELS = {
    mm: {
        commonQuestions: "အမေးများသော မေးခွန်းများ",
        toggleLang: "EN"
    },
    en: {
        commonQuestions: "Common Questions",
        toggleLang: "MM"
    }
};

interface QuickRepliesProps {
    onSelect: (text: string) => void;
}

const QuickReplies = memo(function QuickReplies({ onSelect }: QuickRepliesProps) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [language, setLanguage] = useState<Language>("mm"); // Myanmar as default

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                const url = `${BASE_URL}/shortQuestion/api/byPageId/${PAGE_ID}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                // Ensure data is array
                const items = Array.isArray(data) ? data : data.rows || [];
                setQuestions(items);
            } catch (err) {
                console.error("QuickReplies Fetch Error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const displayQuestions = useMemo(() => {
        return questions.map(q => {
            const title = language === "en" ? q.Title : (q.BurmeseTitle || q.Title);
            return {
                id: q.Id,
                text: title,
                dataSource: q.DataSource || "",
                icon: HelpCircle
            };
        }).filter(q => q.text); // Filter out empty titles
    }, [questions, language]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-6 shrink-0 bg-[var(--bg1)] border-t border-[var(--bg3)]">
                <Loader2 size={18} className="animate-spin text-[var(--t2)]" strokeWidth={3} />
            </div>
        );
    }

    if (displayQuestions.length === 0) return null;

    return (
        <div
            className="flex flex-col gap-2.5 py-4 shrink-0 animate-fadeIn group/replies bg-[var(--bg1)] border-t border-[var(--bg3)] relative z-30"
            role="complementary"
            aria-label="Quick reply suggestions"
        >
            <div className="px-5 flex items-center gap-2.5 mb-1">
                <span className="text-[10px] font-black text-[var(--t3)] uppercase tracking-[0.2em] flex items-center gap-2 shrink-0">
                    <Sparkles size={11} className="text-[var(--a2)] animate-pulse" strokeWidth={3} />
                    {LABELS[language].commonQuestions}
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--bg3)] via-[var(--bg3)] to-transparent" />
                {/* Language Toggle */}
                <button
                    onClick={() => setLanguage(language === "mm" ? "en" : "mm")}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg2)] hover:bg-[var(--a2)] hover:text-[var(--t1)] rounded-full text-[10px] font-bold text-[var(--t3)] transition-all duration-300 shrink-0 border border-[var(--bg3)]"
                    aria-label="Toggle language"
                >
                    <Globe size={11} strokeWidth={2.5} />
                    <span>{LABELS[language].toggleLang}</span>
                </button>
            </div>

            <div className="relative px-5">
                <div
                    id="quick-replies-scroll"
                    className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 snap-x scroll-smooth"
                    role="list"
                >
                    {displayQuestions.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                // Set the dataSource for the AI to use
                                if (q.dataSource) {
                                    localStorage.setItem("ActiveDataSource", q.dataSource);
                                } else {
                                    localStorage.removeItem("ActiveDataSource");
                                }
                                onSelect(q.text);
                            }}
                            className="snap-start flex-none px-5 py-3 bg-[var(--bg1)] border border-[var(--bg3)] hover:border-[var(--a2)] hover:bg-[var(--bg2)] hover:text-[var(--t3)] rounded-[1.2rem] text-[12px] font-bold text-[var(--t2)] whitespace-nowrap transition-all duration-300 flex items-center gap-2.5 group/btn active:scale-95 shadow-sm hover:shadow-md"
                            role="listitem"
                            aria-label={`Quick reply: ${q.text}`}
                        >
                            <div className="w-6 h-6 rounded-lg bg-[var(--bg2)] flex items-center justify-center group-hover/btn:bg-[var(--a2)]/10 transition-colors">
                                <q.icon size={13} className="text-[var(--a2)]" strokeWidth={2.5} />
                            </div>
                            {q.text}
                        </button>
                    ))}
                </div>


                {/* Navigation (Desktop Hover) */}
                <button
                    onClick={() => document.getElementById('quick-replies-scroll')?.scrollBy({ left: -200, behavior: 'smooth' })}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--bg1)] border border-[var(--bg3)] rounded-full shadow-xl flex items-center justify-center text-[var(--t2)] hover:bg-[var(--bg2)] hover:text-[var(--a2)] opacity-0 group-hover/replies:opacity-100 transition-all duration-300 hidden sm:flex z-10"
                    aria-label="Scroll left"
                >
                    <ArrowLeft size={16} strokeWidth={3} />
                </button>
                <button
                    onClick={() => document.getElementById('quick-replies-scroll')?.scrollBy({ left: 200, behavior: 'smooth' })}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-[var(--bg1)] border border-[var(--bg3)] rounded-full shadow-xl flex items-center justify-center text-[var(--t2)] hover:bg-[var(--bg2)] hover:text-[var(--a2)] opacity-0 group-hover/replies:opacity-100 transition-all duration-300 hidden sm:flex z-10"
                    aria-label="Scroll right"
                >
                    <ArrowLeft size={16} className="rotate-180" strokeWidth={3} />
                </button>
            </div>
        </div>
    );
});

export default QuickReplies;
