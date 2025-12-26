import React, { useEffect, useState, useCallback } from "react";
import { ChevronUp, ChevronDown, ArrowRight, Circle } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";
import SkeletonLoadingComp from "./SkeletonLoadingComp";


interface Props {
  dataSource: string;
  idField?: string;
}

export default function SliderBlockFour({
  dataSource,
  idField = "id"
}: Props) {
  const [items, setItems] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);



  if (error) {
    return (
      <div className="-mx-5 -my-5 min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold mb-2">Unable to Load Slider</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-5 -mt-5 mb-5 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {loading ? (
        <SkeletonLoadingComp count={1} layout="card" />
      ) : items.length === 0 ? (
        <div className="h-screen flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-xl text-gray-400">No images available</p>
          </div>
        </div>
      ) : (
        <div className="relative h-screen flex items-center py-20">
          <div className="w-full max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Image with Timeline */}
              <div className="relative">
                {/* Timeline Indicators */}
                <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between items-center py-4">
                  {items.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToSlide(idx)}
                      className="group relative"
                      aria-label={`Go to slide ${idx + 1}`}
                    >
                      <div
                        className={`transition-all duration-500 rounded-full ${
                          currentIndex === idx
                            ? "w-4 h-4 bg-blue-500 shadow-lg shadow-blue-500/50"
                            : "w-2 h-2 bg-gray-600 hover:bg-gray-400"
                        }`}
                      />
                      {currentIndex === idx && (
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-gray-400 font-mono">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                  
                  {/* Connecting Line */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
                </div>

                {/* Image Container with Parallax Effect */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
                  {items.map((item, idx) => {
                    const imageUrl = getImageUrl("/uploads/" + item?.Thumbnail);
                    const isActive = currentIndex === idx;
                    
                    return (
                      <div
                        key={idx}
                        className={`transition-all duration-700 ${
                          isActive
                            ? "opacity-100 relative"
                            : "opacity-0 absolute inset-0"
                        }`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={item?.Title || `Slide ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            loading="lazy"
                          />
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-blue-500/20" />
                        </div>
                        
                        {/* Slide Number Badge */}
                        <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                          <span className="text-white font-mono text-sm">
                            {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="relative space-y-8">
                {items.map((item, idx) => {
                  const isActive = currentIndex === idx;
                  const heading = item?.Title;
                  const description = item?.Description;
                  
                  return (
                    <div
                      key={idx}
                      className={`transition-all duration-700 ${
                        isActive
                          ? "opacity-100 translate-x-0 relative"
                          : "opacity-0 translate-x-8 absolute inset-0"
                      }`}
                    >
                      {/* Category or Tag */}
                      <div className="flex items-center gap-2 mb-4">
                        <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />
                        <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                          Featured
                        </span>
                      </div>

                      {/* Title */}
                      {heading && (
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                          {heading}
                        </h1>
                      )}

                      {/* Description */}
                      {description && (
                        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                          {description}
                        </p>
                      )}

                      {/* CTA Button */}
                      <a
                        href="/contact"
                        className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:gap-5 group/button shadow-lg shadow-blue-600/30"
                      >
                        Learn More
                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            <button
              onClick={goToPrev}
              disabled={loading || items.length === 0}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 disabled:opacity-50"
              aria-label="Previous"
            >
              <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
            </button>

            <button
              onClick={goToNext}
              disabled={loading || items.length === 0}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all duration-300 hover:scale-110 active:scale-95 border border-white/20 disabled:opacity-50"
              aria-label="Next"
            >
              <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}