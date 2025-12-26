import React from "react";

interface Props {
  count?: number;
  layout?: "hero" | "card" | "grid";
}

export default function SkeletonLoadingComp({ count = 3, layout = "hero" }: Props) {
  const items = Array.from({ length: count });

  return (
    <>
      <div className="flex w-full">
        {items.map((_, i) => (
          <div key={i} className="flex-1 p-2">
            <div className={`w-full ${layout === "hero" ? "h-[420px] md:h-[600px]" : layout === "card" ? "h-64" : "h-40"} overflow-hidden rounded-2xl relative`}>
              <div className="absolute inset-0 bg-gray-700/80 rounded-2xl skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .skeleton-shimmer {
          background: linear-gradient(90deg, rgba(82,82,82,0.9) 0%, rgba(120,120,120,0.85) 50%, rgba(82,82,82,0.9) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.6s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
