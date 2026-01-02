"use client";
import React from "react";

export function ListModalSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className="relative bg-[var(--bg1)] rounded-2xl p-5 border border-[var(--bg2)] overflow-hidden"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    {/* Animated shimmer effect */}
                    <div
                        className="absolute inset-0 -translate-x-full animate-shimmer"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            animationDuration: '1.5s',
                            animationIterationCount: 'infinite',
                        }}
                    />

                    <div className="flex gap-5">
                        {/* Image placeholder with pulse */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                            {/* Badge placeholder */}
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-200 animate-pulse" />
                        </div>

                        <div className="flex-1 space-y-4">
                            {/* Title row */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-2/3 animate-pulse" />
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />
                            </div>

                            {/* Subtitle lines */}
                            <div className="space-y-2">
                                <div className="h-3.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                                <div className="h-3.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg w-4/5 animate-pulse" style={{ animationDelay: '0.2s' }} />
                            </div>

                            {/* Grid chips placeholder */}
                            <div className="flex gap-2 pt-2">
                                {[...Array(3)].map((_, j) => (
                                    <div
                                        key={j}
                                        className="h-7 w-20 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-pulse"
                                        style={{ animationDelay: `${j * 100}ms` }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Action button placeholder */}
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl flex-shrink-0 animate-pulse" />
                    </div>
                </div>
            ))}

            {/* CSS for shimmer animation */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
        </div>
    );
}
