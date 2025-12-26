import React, { useState, useEffect, memo, useMemo } from "react";
import {
    Sparkles, ShoppingBag, Settings, BookOpen, User, Tag,
    Clock, MapPin, ArrowLeft, GraduationCap, Award, Calendar,
    Phone, Mail, HelpCircle, Loader2
} from "lucide-react";
import { BASE_URL, PAGE_ID, APP_NAME } from "../../../../config";

/**
 * Standardizes Block names into base dataSource names (e.g. BrandOne -> brand)
 */
const toLocaleDataSource = (block: string) => {
    if (!block) return "";
    const match = block.match(/^(Article|Brand|Product|Service|Course|Book|University|Project|Testimonial|Address|Advantage|Client|CustomSlider|Certificate|Page)/i);
    const base = match ? match[0] : block;
    return base.charAt(0).toLowerCase() + base.slice(1);
};

interface QuickRepliesProps {
    onSelect: (text: string) => void;
}

const QuickReplies = memo(function QuickReplies({ onSelect }: QuickRepliesProps) {
    const [sortedItems, setSortedItems] = useState<any[]>([]);
    const [contactInfo, setContactInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const pageUrl = `${BASE_URL}/page/api/${PAGE_ID}`;
                const contactUrl = `${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`;

                const [pRes, cRes] = await Promise.all([
                    fetch(pageUrl),
                    fetch(contactUrl)
                ]);

                const pData = await pRes.json();
                const cData = await cRes.json();


                if (cData) setContactInfo(Array.isArray(cData) ? cData[0] : cData);

                const data = Array.isArray(pData) ? pData[0] : pData;
                if (data?.ItemList) {
                    const parsed = typeof data.ItemList === 'string' ? JSON.parse(data.ItemList) : data.ItemList;
                    if (Array.isArray(parsed)) {
                        const sorted = parsed.sort((a: any, b: any) => Number(a.Weight || 0) - Number(b.Weight || 0));
                        setSortedItems(sorted);
                    }
                }
            } catch (err) {
                console.error("QuickReplies Fetch Error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // 1. Generate Questions Dynamically with Natural Language & Grouping
    const blockQuestions = useMemo(() => {
        if (!sortedItems.length) return [];

        const questions: { text: string; icon: any; priority: number }[] = [];
        const seenTypes = new Set<string>();

        const templates = [
            "I want to buy {t}",
            "How much is {t}?",
            "I'd like to order {t}",
            "Show me the price for {t}",
            "Is {t} available to buy?"
        ];

        sortedItems.forEach((item, idx) => {
            const blockName = item.Block || "";
            if (blockName.toLowerCase().includes("slider")) return;

            const ds = toLocaleDataSource(blockName);
            const lowDs = ds.toLowerCase();
            const title = item.HeadingTitle;

            // Priority: Higher is first
            let priority = 5;
            let text = "";
            let icon = HelpCircle;

            // Grouping logic: Don't show too many of the same type
            if (seenTypes.has(lowDs) && seenTypes.size > 2) return;

            const template = templates[idx % templates.length];

            if (lowDs.includes("product")) {
                text = title ? template.replace("{t}", title) : "Show me products I can buy";
                icon = ShoppingBag;
                priority = 10;
            } else if (lowDs.includes("service")) {
                text = title ? `I'm interested in buying ${title}` : "What services can I book?";
                icon = Settings;
                priority = 9;
            } else if (lowDs.includes("book")) {
                text = "I want to buy a book";
                icon = BookOpen;
                priority = 10; // High priority for sales
            } else if (lowDs.includes("university") || lowDs.includes("course")) {
                text = "How can I enroll in a program?";
                icon = GraduationCap;
                priority = 8;
            } else if (lowDs.includes("article") || lowDs.includes("news")) {
                text = "Read latest updates";
                icon = BookOpen;
                priority = 4;
            } else if (lowDs.includes("testimonial") || lowDs.includes("client")) {
                text = "Show me successful projects";
                icon = User;
                priority = 3;
            } else if (lowDs.includes("advantage")) {
                text = "Why should I buy from you?";
                icon = Award;
                priority = 7;
            } else if (lowDs.includes("project")) {
                text = "Show me your work quality";
                icon = Settings;
                priority = 6;
            } else {
                if (seenTypes.has(lowDs)) return;
                text = title ? template.replace("{t}", title) : `How to buy ${ds}?`;
                priority = 2;
            }

            questions.push({ text, icon, priority });
            seenTypes.add(lowDs);
        });

        return questions;
    }, [sortedItems]);

    // 2. Add Business Profile Questions & Actions
    const commonQuestions = useMemo(() => {
        const questions: { text: string; icon: any; priority: number }[] = [];
        if (!contactInfo) return questions;

        if (contactInfo.OpenTime) questions.push({ text: "Tell me your business hours", icon: Clock, priority: 11 });
        if (contactInfo.Address) questions.push({ text: "Where is your location?", icon: MapPin, priority: 12 });
        if (contactInfo.PhoneOne || contactInfo.PhoneTwo) questions.push({ text: "Give me your contact number", icon: Phone, priority: 13 });
        if (contactInfo.Email) questions.push({ text: "What is your email address?", icon: Mail, priority: 1 });
        if (contactInfo.Description) {
            questions.push({ text: `About ${APP_NAME}`, icon: HelpCircle, priority: 15 });
        }
        return questions;
    }, [contactInfo]);

    // 3. Combine, Sort and Limit
    const allQuestions = useMemo(() => {
        const combined = [...commonQuestions, ...blockQuestions];
        if (combined.length === 0 && !isLoading) {
            combined.push(
                { text: "Help me get started", icon: Sparkles, priority: 100 },
                { text: "I have a specific question", icon: HelpCircle, priority: 50 },
                { text: "Talk to a human agent", icon: User, priority: 10 }
            );
        }
        return combined
            .sort((a, b) => b.priority - a.priority)
            .filter((q, index, self) => index === self.findIndex((t) => t.text === q.text))
            .slice(0, 12);
    }, [blockQuestions, commonQuestions, isLoading]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-4 shrink-0 bg-slate-900/50">
                <Loader2 size={16} className="animate-spin text-slate-500" />
            </div>
        );
    }

    if (allQuestions.length === 0) return null;

    return (
        <div
            className="flex flex-col gap-2 py-3 shrink-0 animate-fadeIn group/replies bg-slate-950/20 backdrop-blur-md border-t border-white/[0.03]"
            role="complementary"
            aria-label="Quick reply suggestions"
        >
            <div className="px-5 flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5 shrink-0">
                    <Sparkles size={10} className="text-amber-400 animate-pulse" />
                    Smart Suggestions
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-transparent" />
            </div>

            <div className="relative px-5">
                <div
                    id="quick-replies-scroll"
                    className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 snap-x scroll-smooth"
                    role="list"
                >
                    {allQuestions.map((q: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => onSelect(q.text)}
                            className="snap-start flex-none px-4 py-2.5 bg-slate-800/40 border border-white/[0.05] hover:border-blue-500/50 hover:bg-blue-600/10 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white whitespace-nowrap transition-all duration-300 flex items-center gap-2 group/btn active:scale-95 shadow-lg shadow-black/20"
                            role="listitem"
                            aria-label={`Quick reply: ${q.text}`}
                        >
                            <div className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center group-hover/btn:bg-blue-500/20 transition-colors">
                                <q.icon size={12} className="text-slate-400 group-hover/btn:text-blue-400 transition-colors" />
                            </div>
                            {q.text}
                        </button>
                    ))}
                </div>


                {/* Navigation (Desktop Hover) */}
                <button
                    onClick={() => document.getElementById('quick-replies-scroll')?.scrollBy({ left: -200, behavior: 'smooth' })}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-slate-700 opacity-0 group-hover/replies:opacity-100 transition-all duration-300 hidden sm:flex z-10"
                    aria-label="Scroll left"
                >
                    <ArrowLeft size={14} />
                </button>
                <button
                    onClick={() => document.getElementById('quick-replies-scroll')?.scrollBy({ left: 200, behavior: 'smooth' })}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-slate-700 opacity-0 group-hover/replies:opacity-100 transition-all duration-300 hidden sm:flex z-10"
                    aria-label="Scroll right"
                >
                    <ArrowLeft size={14} className="rotate-180" />
                </button>
            </div>
        </div>
    );
});

export default QuickReplies;
