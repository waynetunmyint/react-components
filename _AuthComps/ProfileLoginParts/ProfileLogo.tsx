import React from 'react';
import { APP_NAME, IMAGE_URL } from "@/config";

interface ProfileLogoProps {
    pageData: any;
    logoLoaded: boolean;
    setLogoLoaded: (loaded: boolean) => void;
}

const ProfileLogo: React.FC<ProfileLogoProps> = ({ pageData, logoLoaded, setLogoLoaded }) => {
    return (
        <div className="w-full max-w-sm">
            <div className="relative inline-block">
                {/* Animated Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>

                {/* Skeleton Loader */}
                {!logoLoaded && (
                    <div className="relative w-48 h-48 rounded-3xl mx-auto shadow-2xl border-4 border-[var(--bg1)] bg-gradient-to-br from-blue-900 to-purple-900  overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>

                        {/* Pulsing circles */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute w-32 h-32 border-4 border-blue-400 rounded-full animate-ping"></div>
                            <div className="absolute w-24 h-24 border-4 border-purple-400 rounded-full animate-pulse"></div>
                            <div className="relative w-16 h-16 border-4 border-[var(--bg1)] border-t-transparent rounded-full animate-spin"></div>
                        </div>

                        {/* Loading text */}
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                            <p className="text-[var(--t1)] text-xs font-medium animate-pulse">Loading...</p>
                        </div>
                    </div>
                )}

                {/* Actual Logo */}
                <img
                    src={pageData?.Thumbnail ? `${IMAGE_URL}/uploads/${pageData?.Thumbnail}` : ''}
                    alt={`${APP_NAME} Logo`}
                    loading="eager"
                    className='rounded-xl relative w-48 h-48 mx-auto shadow-2xl border-4 border-[var(--bg1)] object-contain transition-all duration-700'
                    style={{
                        opacity: logoLoaded ? 1 : 0,
                        transform: logoLoaded ? 'scale(1)' : 'scale(0.95)',
                        position: logoLoaded ? 'relative' : 'absolute',
                        inset: logoLoaded ? 'auto' : 0
                    }}
                    onLoad={() => setLogoLoaded(true)}
                    onError={() => setLogoLoaded(true)}
                />
            </div>
        </div>
    );
};

export default ProfileLogo;
