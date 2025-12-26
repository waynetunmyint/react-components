import React from 'react';

export const AdminListSkeleton = () => {
    return (
        <div className="mx-auto w-full space-y-3">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-[1.25rem] p-4 border border-slate-100 flex items-start gap-4 animate-pulse shadow-sm"
                >
                    {/* Image Placeholder */}
                    <div className="w-[70px] h-[88px] rounded-xl bg-slate-100 shrink-0 relative overflow-hidden">
                        <div className="skeleton-shimmer absolute inset-0" />
                    </div>

                    <div className="flex-1 space-y-2.5 py-0.5">
                        {/* Title Placeholder */}
                        <div className="h-5 bg-slate-100 rounded-lg w-3/4 relative overflow-hidden">
                            <div className="skeleton-shimmer absolute inset-0" />
                        </div>
                        {/* Subline Placeholders */}
                        <div className="space-y-1.5">
                            <div className="h-3.5 bg-slate-50 rounded-md w-1/2 relative overflow-hidden">
                                <div className="skeleton-shimmer absolute inset-0" />
                            </div>
                            <div className="h-3.5 bg-slate-50 rounded-md w-1/3 relative overflow-hidden">
                                <div className="skeleton-shimmer absolute inset-0" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
