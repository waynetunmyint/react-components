import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../../config";

interface Props {
  dataSource: string;
}

export default function SliderNineOne({ dataSource }: Props) {
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

  const scroll = useCallback(
    (direction: "left" | "right") => {
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
    },
    [currentIndex, items.length]
  );

  const goToSlide = useCallback((index: number) => {
    if (!sliderRef.current) return;
    setCurrentIndex(index);
    sliderRef.current.scrollTo({
      left: index * sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || items.length === 0 || isHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }

    autoPlayRef.current = setInterval(() => {
      scroll("right");
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, items.length, scroll, isHovered]);

  if (error) {
    return (
      <div className="mb-8 p-8 bg-gradient-to-br from-red-900/20 to-orange-900/20 border-2 border-red-500/30 shadow-lg backdrop-blur-sm">
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
      className="relative mt-0 pt-0 w-full h-auto min-h-[400px] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Slider */}
      <div className="relative h-auto">

        {/* Navigation Left */}
        <button
          onClick={() => scroll("left")}
          disabled={loading || items.length === 0}
          className={`absolute left-6 top-1/2 -translate-y-1/2 z-30
            bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
            rounded-full p-4 transition-all duration-300 disabled:opacity-0
            ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
            hover:scale-110 active:scale-95 shadow-2xl`}
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>

        {/* Navigation Right */}
        <button
          onClick={() => scroll("right")}
          disabled={loading || items.length === 0}
          className={`absolute right-6 top-1/2 -translate-y-1/2 z-30
            bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
            rounded-full p-4 transition-all duration-300 disabled:opacity-0
            ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
            hover:scale-110 active:scale-95 shadow-2xl`}
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>

        {/* Play / Pause */}
        {!loading && items.length > 0 && (
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`absolute top-6 right-6 z-30
              bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
              rounded-full p-3 transition-all duration-300
              ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
              hover:scale-110 active:scale-95 shadow-2xl`}
            aria-label={isAutoPlaying ? "Pause" : "Play"}
          >
            {isAutoPlaying ? (
              <Pause className="w-5 h-5 text-white" fill="white" />
            ) : (
              <Play className="w-5 h-5 text-white" fill="white" />
            )}
          </button>
        )}

        {/* Slider */}
        <div ref={sliderRef} className="no-scrollbar w-full h-auto overflow-x-hidden scroll-smooth flex">
          {loading ? (
            <></>
          ) : items.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-white/60 text-xl font-semibold">No images available</p>
              </div>
            </div>
          ) : (
            items.map((item, idx) => {
              const imageUrl = getImageUrl("/uploads/" + item?.Thumbnail);
              const title = item?.Title;
              const description = item?.Description;

              return (
                <div key={item.Id || idx} className="slider-card relative w-full h-auto flex-shrink-0 overflow-hidden group">
                  {/* Image */}
                  <div className="w-full h-auto overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={title || `Slide ${idx + 1}`}
                      className="w-full h-auto transition-transform duration-[8000ms] ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Overlay gradients */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Content */}
                  <div className="absolute inset-0 flex items-center z-10">
                    <div className="container mx-auto px-8 md:px-16">
                      <div className="max-w-3xl">

                        <div className="text-white/60 font-mono text-sm mb-4 tracking-widest">
                          {String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                        </div>

                        {title && (
                          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            {title}
                          </h1>
                        )}

                        {description && (
                          <p className="text-lg md:text-xl text-gray-300 mb-8 line-clamp-3 leading-relaxed">
                            {description}
                          </p>
                        )}

                        <a
                          href="/contact"
                          className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:gap-5 group/button shadow-2xl"
                        >
                          Learn More
                          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Thumbnail Navigation */}
        {!loading && items.length > 0 && (
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 max-w-7xl transition-all duration-300
              ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 shadow-2xl">
              <div className="flex gap-3 overflow-x-auto no-scrollbar px-2">
                {items.map((item, idx) => {
                  const imageUrl = getImageUrl("/uploads/" + item?.Thumbnail);
                  const title = item?.Title;
                  const isActive = currentIndex === idx;

                  return (
                    <button
                      key={item.Id || idx}
                      onClick={() => goToSlide(idx)}
                      className={`relative flex-shrink-0 transition-all duration-300 overflow-hidden
                        ${isActive
                          ? "ring-2 ring-white scale-105 shadow-2xl"
                          : "ring-1 ring-white/20 hover:ring-white/50 hover:scale-105 opacity-60 hover:opacity-100"
                        }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    >
                      <div className="relative w-24 h-16 md:w-32 md:h-20 bg-black/50">
                        <img
                          src={imageUrl}
                          alt={title || `Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />

                        <div
                          className={`absolute inset-0 transition-all duration-300 ${isActive ? "bg-white/10" : "bg-black/40 hover:bg-black/20"
                            }`}
                        />

                        {isActive && (
                          <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse" />
                          </div>
                        )}

                        {isActive && isAutoPlaying && !isHovered && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                              className="h-full bg-white transition-all duration-[5000ms] ease-linear"
                              style={{ width: "100%" }}
                              key={currentIndex}
                            />
                          </div>
                        )}
                      </div>

                      {title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                          <p className="text-white text-[10px] md:text-xs font-medium truncate">{title}</p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Auto-play progress bar */}
        {!loading && items.length > 0 && isAutoPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
            <div
              className="h-full bg-white transition-all duration-[5000ms] ease-linear"
              style={{
                width: isHovered ? "0%" : "100%",
                transition: isHovered ? "width 0s" : "width 5000ms linear",
              }}
              key={currentIndex}
            />
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
