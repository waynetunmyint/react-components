"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, RefreshCcw } from "lucide-react";

interface Props {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  children: React.ReactNode;
}

export default function UniversalRefresherComp({
  onRefresh,
  threshold = 80,
  children,
}: Props) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef<number | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0 && !refreshing) {
        pullStartY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (pullStartY.current === null || refreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - pullStartY.current;

      if (distance > 0) {
        setPullDistance(Math.min(distance / 2, threshold * 1.5));
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true);
        setPullDistance(threshold); // lock at threshold for animation
        try {
          await onRefresh();
        } finally {
          // smooth transition back
          setPullDistance(0);
          setTimeout(() => setRefreshing(false), 300);
        }
      } else {
        setPullDistance(0);
      }
      pullStartY.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pullDistance, refreshing, onRefresh, threshold]);

  return (
    <div className="relative overflow-hidden">
      {/* Refresh Indicator */}
      <div
        className="fixed top-0 left-0 right-0 flex justify-center items-center z-[9999] text-blue-500 pointer-events-none"
        style={{
          height: 50,
          opacity: pullDistance > 10 || refreshing ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        {refreshing ? (
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                pullDistance > threshold ? "rotate-180" : ""
              }`}
            />
            <span className="text-xs text-gray-500">Pull to refresh</span>
          </div>
        )}
      </div>

      {/* Content moves smoothly */}
      <div
        className={`transition-transform duration-300 ease-out`}
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
