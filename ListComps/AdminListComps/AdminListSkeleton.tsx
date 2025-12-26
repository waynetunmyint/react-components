import React from 'react';

export const AdminListSkeleton = () => {
    return (
        <div className="mx-auto w-full space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-[2rem] p-5 border border-slate-100 flex items-start gap-5 animate-pulse shadow-sm h-[130px]"
                >
                    {/* Image Placeholder */}
                    <div className="w-[80px] sm:w-[100px] aspect-[4/5] rounded-2xl bg-slate-100 shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]" />
                    </div>

                    <div className="flex-1 space-y-4 py-1">
                        {/* Title Placeholder */}
                        <div className="h-6 bg-slate-100 rounded-xl w-4/5 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]" />
                        </div>
                        {/* Subline Placeholders */}
                        <div className="space-y-2.5">
                            <div className="h-3.5 bg-slate-50 rounded-lg w-2/3 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]" />
                            </div>
                            <div className="h-3.5 bg-slate-50 rounded-lg w-1/2 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(150%); }
                }
            `}</style>
        </div>
    );
};
