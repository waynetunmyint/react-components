import React from "react";
import * as LucideIcons from "lucide-react";
import BlockHeader from "../HelperComps/BlockHeader";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function AdvantageOne({
    items = [],
    loading = false,
    error = null,
    headingTitle,
    subHeadingTitle,
    dataSource,
}: Props) {
    const Skeleton = () => (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mb-6" />
            <div className="h-6 bg-gray-100 rounded w-3/4 mb-4" />
            <div className="space-y-2 w-full flex flex-col items-center">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
                <div className="h-4 bg-gray-100 rounded w-4/6" />
            </div>
        </div>
    );

    if (error) {
        return null;
    }

    return (
        <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <BlockHeader
                    headingTitle={headingTitle || "Why Choose Us"}
                    subHeadingTitle={subHeadingTitle}
                    showSwitcher={false}
                    dataSource={dataSource}
                    showViewAll={false}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No items available
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const IconName = item.Icon;
                            const IconComp = IconName && (LucideIcons as any)[IconName]
                                ? (LucideIcons as any)[IconName]
                                : null;

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] border border-gray-100/80 hover:border-[var(--theme-primary-bg)]/10 transition-all duration-500 ease-out hover:-translate-y-2 flex flex-col items-center text-center cursor-default"
                                >
                                    <div className="relative w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-[var(--theme-accent)]/10 to-[var(--theme-primary-bg)]/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out">
                                        {IconComp ? (
                                            <IconComp
                                                className="w-12 h-12 text-[var(--theme-primary-bg)] drop-shadow-sm"
                                                strokeWidth={1.5}
                                            />
                                        ) : (
                                            <LucideIcons.HelpCircle className="w-12 h-12 text-[var(--theme-primary-bg)]/50" />
                                        )}
                                        <div className="absolute inset-0 bg-[var(--theme-accent)]/5 rounded-full blur-xl -z-10 group-hover:bg-[var(--theme-accent)]/10 transition-colors" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-[var(--theme-primary-bg)] transition-colors duration-300">
                                        {item.Title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                                        {item.Description}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
