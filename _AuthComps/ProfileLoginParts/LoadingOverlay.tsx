import React from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black  flex justify-center items-center z-40">
            <div className="bg-[var(--bg1)]  rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 border border-[var(--bg2)]">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-[var(--bg3)] rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[var(--t3)] font-semibold">Signing you in...</p>
                <p className="text-[var(--t2)] text-sm">Please wait a moment</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
