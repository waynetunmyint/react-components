import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { BASE_URL, IMAGE_URL, APP_BG_COLOR } from "../../config";
import SkeletonLoadingComp from "./SkeletonLoadingComp";


interface Props {
  dataSource: string;
  idField?: string;
}

export default function SliderBlockThree({
  dataSource,
  idField = "id"
}: Props) {
  const [items, setItems] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

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
      const message =
        err instanceof Error ? err.message : "Error fetching slider data";
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
      : "https://via.placeholder.com/800x600?text=No+Image";
  }, []);

  const goToNext = useCallback(() => {
    setDirection("right");
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setDirection("left");
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
  }, [currentIndex]);



  if (error) {
    return (
      <div className="-mx-5 -my-5 min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold mb-2">Unable to Load Slider</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-5 -mt-5 mb-5 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <SkeletonLoadingComp count={1} layout="hero" />
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-xl text-gray-500">No images available</p>
          </div>
        ) : (
          <div className="relative">
            {/* Card Stack Container */}
            <div className="relative h-[600px] flex items-center justify-center">
              {items.map((item, idx) => {
                const imageUrl = getImageUrl("/uploads/" + item?.Thumbnail);
                const heading = item?.Title;
                const description = item?.Description;
                
                // Calculate position relative to current index
                const offset = idx - currentIndex;
                const absOffset = Math.abs(offset);
                
                // Show only current and adjacent cards
                if (absOffset > 2) return null;

                // Calculate transforms based on position
                let transform = "";
                let opacity = 1;
                let zIndex = 10;
                let scale = 1;

                if (offset === 0) {
                  // Current card
                  transform = "translateX(0) translateY(0) rotate(0deg)";
                  opacity = 1;
                  zIndex = 30;
                  scale = 1;
                } else if (offset === 1) {
                  // Next card
                  transform = "translateX(60%) translateY(30px) rotate(4deg)";
                  opacity = 0.7;
                  zIndex = 20;
                  scale = 0.9;
                } else if (offset === -1) {
                  // Previous card
                  transform = "translateX(-60%) translateY(30px) rotate(-4deg)";
                  opacity = 0.7;
                  zIndex = 20;
                  scale = 0.9;
                } else if (offset > 1) {
                  // Cards further right
                  transform = "translateX(80%) translateY(50px) rotate(6deg)";
                  opacity = 0.3;
                  zIndex = 10;
                  scale = 0.8;
                } else {
                  // Cards further left
                  transform = "translateX(-80%) translateY(50px) rotate(-6deg)";
                  opacity = 0.3;
                  zIndex = 10;
                  scale = 0.8;
                }

                return (
                  <div
                    key={idx}
                    className="absolute inset-0 transition-all duration-700 ease-out"
                    style={{
                      transform: `${transform} scale(${scale})`,
                      opacity,
                      zIndex,
                      pointerEvents: offset === 0 ? "auto" : "none"
                    }}
                  >
                    <div className="max-w-7xl mx-auto h-full">
                      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col md:flex-row group hover:shadow-3xl transition-shadow duration-300">
                        {/* Image Section */}
                        <div className="md:w-1/2 h-64 md:h-full relative overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={heading || `Slide ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          
                          {/* Slide Counter on Image */}
                          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                            <span className="text-sm font-bold text-gray-800">
                              {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                            </span>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                          {heading && (
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                              {heading}
                            </h2>
                          )}

                          {description && (
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed line-clamp-4">
                              {description}
                            </p>
                          )}

                          <a
                            href="/contact"
                            className={`inline-flex items-center gap-3  text-gray-500 px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-all duration-300 hover:gap-5 group/button shadow-lg w-fit`}
                          >
                            Learn More
                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={goToPrev}
                className="bg-white hover:bg-gray-50 text-gray-800 rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-200"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
              </button>

              {/* Dot Navigation */}
              <div className="flex gap-2">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      currentIndex === idx
                        ? "w-10 h-3 bg-blue-600"
                        : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="bg-white hover:bg-gray-50 text-gray-800 rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 border border-gray-200"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}