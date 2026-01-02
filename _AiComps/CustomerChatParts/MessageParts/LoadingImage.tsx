import React, { memo, useState, useCallback } from "react";
import { Loader2, ImageOff } from "lucide-react";

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
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--t2)]/20 via-[var(--t2)]/30 to-[var(--t2)]/20 animate-shimmer bg-[length:200%_100%]">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-[var(--t2)] animate-spin" />
                    </div>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 bg-[var(--a3)] flex flex-col items-center justify-center gap-1">
                    <ImageOff className="w-6 h-6 text-[var(--t2)]" />
                    <span className="text-[8px] text-[var(--t2)] uppercase tracking-wider">No Image</span>
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

export default LoadingImage;
