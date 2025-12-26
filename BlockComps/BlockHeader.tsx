import React from "react";
import { LayoutGrid, List, ArrowRight } from "lucide-react";

interface Props {
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    viewMode?: "list" | "grid" | "largeGrid";
    onViewModeChange?: (mode: "list" | "grid" | "largeGrid") => void;
    dataSource?: string;
    showViewAll?: boolean;
    showSwitcher?: boolean;
}

export default function BlockHeader({
    headingTitle,
    subHeadingTitle,
    viewMode = "grid",
    onViewModeChange,
    dataSource,
    showViewAll = true,
    showSwitcher = true,
}: Props) {
    return (
        <div className="flex flex-col items-center justify-center mb-12 px-4 gap-6 text-center">
            <div className="max-w-3xl">
                {headingTitle && (
                    <h2
                        style={{ color: 'var(--accent-500)' }}
                        className="text-3xl sm:text-4xl font-bold leading-tight">
                        {headingTitle}
                    </h2>
                )}
                {subHeadingTitle && (
                    <p className="mt-2 text-gray-500 font-medium text-lg">
                        {subHeadingTitle}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1.5 shadow-inner">
                {showSwitcher && (
                    <div className="flex items-center gap-1">
                        {[
                            { mode: "list", icon: List, size: 20 },
                            { mode: "grid", icon: LayoutGrid, size: 20 },
                            { mode: "largeGrid", icon: LayoutGrid, size: 24 },
                        ].map(({ mode, icon: Icon, size }) => (
                            <button
                                key={mode}
                                onClick={() => onViewModeChange?.(mode as any)}
                                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === mode
                                    ? "text-[var(--accent-500)] bg-white shadow-md scale-105"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
                                    }`}
                                title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                            >
                                <Icon size={size} strokeWidth={viewMode === mode ? 2.5 : 2} />
                            </button>
                        ))}
                    </div>
                )}

                {showViewAll && dataSource && (
                    <>
                        {showSwitcher && <div className="w-px h-8 bg-gray-300 mx-2" />}
                        <button
                            onClick={() => (window.location.href = `/${dataSource}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-700 hover:text-[var(--theme-primary-bg)] transition-colors"
                        >
                            View All
                            <ArrowRight size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
