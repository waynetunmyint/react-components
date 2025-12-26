import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  imageField: string;
  headingField?: string;
}

export default function SliderFullComp({ dataSource, imageField, headingField }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const getData = useCallback(async () => {
    if (!dataSource) {
      setError("No data source provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const endpoint = `/${dataSource}/api`;
      const response = await fetch(`${BASE_URL}${endpoint}`);

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const result = await response.json();

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.items)
        ? result.items
        : Array.isArray(result?.list)
        ? result.list
        : [];

      setItems(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching slider data";
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    getData();
  }, [getData]);

  const getImageUrl = useCallback((fieldValue: string | undefined) => {
    return fieldValue
      ? `${IMAGE_URL}/${fieldValue}`
      : "https://via.placeholder.com/1200x600?text=No+Image";
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!sliderRef.current || items.length === 0) return;

    const slider = sliderRef.current;
    let newIndex;
    
    if (direction === "right") {
      newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    }
    
    setCurrentIndex(newIndex);
    slider.scrollTo({ left: newIndex * slider.clientWidth, behavior: "smooth" });
  }, [currentIndex, items.length]);

  const goToSlide = useCallback((index: number) => {
    if (!sliderRef.current) return;
    setCurrentIndex(index);
    sliderRef.current.scrollTo({
      left: index * sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0 || isHovered) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      scroll("right");
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, items.length, scroll, isHovered]);

  const Skeleton = () => (
    <div className="slider-card flex-shrink-0 relative overflow-hidden w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );

  if (error) {
    return (
      <div className="mb-8 p-8 bg-gradient-to-br from-red-900/20 to-orange-900/20 border-2 border-red-500/30 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <p className="text-red-200 font-semibold text-lg">Unable to Load Slider</p>
            <p className="text-red-300/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full  overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Slider */}
      <div className="relative h-full">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll("left")}
          disabled={loading || items.length === 0}
          className={`absolute left-6 top-1/2 -translate-y-1/2 z-30
                     bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
                     rounded-lg p-4 transition-all duration-300 disabled:opacity-0
                     ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                     hover:scale-110 active:scale-95 shadow-2xl group`}
          aria-label="Previous"
        >
          <ChevronLeft className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => scroll("right")}
          disabled={loading || items.length === 0}
          className={`absolute right-6 top-1/2 -translate-y-1/2 z-30
                     bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
                     rounded-lg p-4 transition-all duration-300 disabled:opacity-0
                     ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
                     hover:scale-110 active:scale-95 shadow-2xl group`}
          aria-label="Next"
        >
          <ChevronRight className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        </button>

        {/* Auto-play Control */}
        {!loading && items.length > 0 && (
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`absolute top-6 right-6 z-30
                       bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
                       rounded-lg p-3 transition-all duration-300
                       ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
                       hover:scale-110 active:scale-95 shadow-2xl group`}
            aria-label={isAutoPlaying ? "Pause" : "Play"}
          >
            {isAutoPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
        )}

        {/* Slide Counter */}
        {!loading && items.length > 0 && (
          <div className={`absolute top-6 left-6 z-30 transition-all duration-300
                          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2">
              <span className="text-white font-semibold text-sm">
                {currentIndex + 1} / {items.length}
              </span>
            </div>
          </div>
        )}

        {/* Slider Container */}
        <div
          ref={sliderRef}
          className="no-scrollbar w-full h-full overflow-x-hidden scroll-smooth flex snap-x snap-mandatory"
        >
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} />)
          ) : items.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center shadow-lg border border-white/10">
                  <span className="text-6xl">📷</span>
                </div>
                <p className="text-white/60 text-xl font-semibold">No images available</p>
              </div>
            </div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl("/uploads/" + item[imageField]);
              const heading = headingField ? item[headingField] : null;

              return (
                <div
                  key={item.Id || idx}
                  className="slider-card relative w-full h-full flex-shrink-0 snap-center overflow-hidden"
                >
                  {/* Image with Ken Burns effect on hover */}
                  <div className="w-full h-full overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={heading || `Image ${idx + 1}`}
                      className="w-full object-cover transition-transform duration-[8000ms] ease-out hover:scale-110"
                    />
                  </div>

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

                  {/* Content */}
                  {heading && (
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <div className="max-w-4xl">
                        <h3 className="text-white text-3xl md:text-5xl font-bold drop-shadow-2xl mb-4 animate-[fadeInUp_0.6s_ease-out]">
                          {heading}
                        </h3>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[fadeInUp_0.8s_ease-out]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Thumbnail Preview */}
      {!loading && items.length > 0 && (
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 max-w-7xl transition-all duration-300
                        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-2">
              {items.map((item, idx) => {
                const imageUrl = getImageUrl("/uploads/" + item[imageField]);
                const heading = headingField ? item[headingField] : null;
                const isActive = currentIndex === idx;

                return (
                  <button
                    key={item.Id || idx}
                    onClick={() => goToSlide(idx)}
                    className={`relative flex-shrink-0 group transition-all duration-300 rounded-xl overflow-hidden
                      ${isActive 
                        ? "ring-2 ring-white scale-105 shadow-2xl" 
                        : "ring-1 ring-white/20 hover:ring-white/50 hover:scale-105 opacity-60 hover:opacity-100"
                      }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <div className="relative w-28 h-20 md:w-36 md:h-24 bg-black/50">
                      <img
                        src={imageUrl}
                        alt={heading || `Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      
                      {/* Overlay */}
                      <div className={`absolute inset-0 transition-all duration-300 ${
                        isActive 
                          ? "bg-blue-500/10" 
                          : "bg-black/50 group-hover:bg-black/30"
                      }`} />
                      
                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse" />
                        </div>
                      )}
                      
                      {/* Progress Bar for Active Slide */}
                      {isActive && isAutoPlaying && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-[slideProgress_5s_linear_infinite] origin-left" />
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Label */}
                    {heading && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                        <p className="text-white text-[10px] md:text-xs font-medium truncate">
                          {heading}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer { 
          100% { transform: translateX(100%); } 
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .no-scrollbar::-webkit-scrollbar { 
          display: none; 
        }
        .no-scrollbar { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
      `}</style>
    </div>
  );
}