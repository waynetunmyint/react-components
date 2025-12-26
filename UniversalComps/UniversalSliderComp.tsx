import React, { useEffect, useRef, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { ChevronLeft, ChevronRight } from "lucide-react";
import UniversalImageModal from "./UniversalImageModal";

interface UniversalSliderCompProps {
  customAPI?: string;
  dataSource?: string;
  imageField: string;
  badgeImage:string;
  headingField: string;
  iconMode?: boolean;
  rowCount?: number; // ✅ added rowCount
}

export default function UniversalSliderComp({
  customAPI,
  dataSource,
  imageField,
  badgeImage,
  headingField,
  iconMode = false,
  rowCount = 1, // ✅ default to 1
}: UniversalSliderCompProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalImageURL, setModalImageURL] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getData = async () => {
    try {
      setLoading(true);
      let response;
      if (customAPI) response = await fetch(`${BASE_URL}${customAPI}`);
      else if (dataSource) response = await fetch(`${BASE_URL}/${dataSource}/api`);

      if (response?.ok) {
        const result = await response.json();
        setItems(result);
      }
    } catch (error) {
      console.error("Error fetching slider data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [customAPI, dataSource]);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const slider = sliderRef.current;
    const card = slider.querySelector("div");
    const cardWidth = card ? (card as HTMLElement).offsetWidth + 16 : 250;

    if (direction === "right") {
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else slider.scrollBy({ left: cardWidth, behavior: "smooth" });
    } else {
      if (slider.scrollLeft <= 0) slider.scrollTo({ left: slider.scrollWidth, behavior: "smooth" });
      else slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
    }
  };

  // Skeleton loader
  const Skeleton = ({ iconMode }: { iconMode: boolean }) =>
    iconMode ? (
      <div className="w-32 bg-white rounded-xl p-3 flex flex-col items-center gap-2 flex-shrink-0 border border-gray-200 shadow-sm animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
    ) : (
      <div className="w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-xl overflow-hidden bg-white flex-shrink-0 animate-pulse">
        <div className="w-full h-44 bg-gray-200" />
        <div className="p-3">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
        </div>
      </div>
    );

  return (
    <div className="mb-8 relative">
      {/* Prev Button */}
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md shadow-sm rounded-full p-2 hover:bg-white transition"
      >
        <ChevronLeft size={22} className="text-blue-700" />
      </button>

      {/* Next Button */}
      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-md shadow-sm rounded-full p-2 hover:bg-white transition"
      >
        <ChevronRight size={22} className="text-blue-700" />
      </button>

      {/* Slider */}
      <div
        ref={sliderRef}
        className={`${
          iconMode
            ? `grid grid-rows-${rowCount} auto-cols-max grid-flow-col gap-3 overflow-x-auto scroll-smooth no-scrollbar px-2`
            : "flex space-x-4 overflow-x-auto scroll-smooth no-scrollbar px-2"
        }`}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} iconMode={iconMode} />)
          : items.map((item, idx) => {
              const imageUrl = item[imageField]
                ? `${IMAGE_URL}/uploads/${item[imageField]}`
                : "https://via.placeholder.com/150?text=No+Image";
              
               const badgeImageUrl = item[badgeImage]
                ? `${IMAGE_URL}/uploads/${item[badgeImage]}`
                : "https://via.placeholder.com/150?text=No+Image";

              return iconMode ? (
                <div
                  key={idx}
                  className="w-32 bg-white rounded-xl p-3 flex flex-col items-center gap-2 flex-shrink-0 
                    border border-gray-200 shadow-sm hover:shadow transition cursor-pointer"
                  onClick={() => (window.location.href = `/${dataSource}/view/${item.Id}`)}
                >
                  {/* Image → Modal */}
                  <img
                    src={imageUrl}
                    alt={item[headingField]}
                    onClick={(e) => {
                      e.stopPropagation(); // prevent navigation
                      setModalImageURL(imageUrl);
                    }}
                    className="w-12 h-12 rounded-lg object-cover cursor-pointer"
                  />

                  {/* Text + Chevron */}
                  <div className="flex flex-col items-center text-center w-full">
                    <p className="text-xs font-medium text-gray-900 line-clamp-1" onClick={() => (window.location.href = `/${dataSource}/view/${item.Id}`)}>
                      {item[headingField]}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  key={idx}
                  className="w-3/4 sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-xl overflow-hidden bg-white flex-shrink-0 snap-start"
                >
                  <div className="w-full h-44 bg-gray-100 cursor-pointer relative">
                    <img
                      src={imageUrl}
                      alt={item[headingField]}
                      onClick={() => (window.location.href = `/${dataSource}/view/${item.Id}`)}
                      className="w-full h-full object-cover"
                    />

                      <img
                      src={badgeImageUrl}
                      alt={item[headingField]}
                      onClick={() => (window.location.href = `/${dataSource}/view/${item.Id}`)}
                      className="w-10 h-10 object-cover rounded-full absolute top-5 right-5"
                    />

                  </div>
                  <div className="p-3">
                    <p
                      onClick={() => (window.location.href = `/${dataSource}/view/${item.Id}`)}
                      className="text-sm text-center font-semibold text-gray-900 truncate cursor-pointer hover:underline"
                    >
                      {item[headingField]}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Image Modal */}
      {modalImageURL && (
        <UniversalImageModal
          imageURL={modalImageURL}
          onClose={() => setModalImageURL(null)}
        />
      )}
    </div>
  );
}
