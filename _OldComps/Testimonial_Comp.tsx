import React, { useEffect, useState, useCallback } from "react";
import { Star, Quote } from "lucide-react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";


interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function TestimonialComp({ dataSource, headingTitle, subHeadingTitle }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getData = useCallback(async () => {
    if (!dataSource) {
      setError("No data source provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/${dataSource}/api`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const result = await response.json();
      const data = Array.isArray(result) ? result : [];
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching data";
      console.error(message, err);
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    getData();
  }, [getData]);

  const getImageUrl = useCallback((thumbnail: string | undefined) => {
    return thumbnail
      ? `${IMAGE_URL}/uploads/${thumbnail}`
      : "https://via.placeholder.com/100x100?text=User";
  }, []);

  const renderStars = (rating: number) => {
    const stars = [];
    const validRating = Math.max(0, Math.min(5, rating || 0));
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={`${
            i <= validRating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          } transition-colors`}
        />
      );
    }
    return stars;
  };

  const Skeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Error Loading Testimonials</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className={`text-3xl md:text-4xl font-bold  mb-4`}>
          {headingTitle || "What Our Clients Say About Us"}
        </h2>
        <p className={`text-sm max-w-2xl mx-auto`}>
          {loading ? "Loading ..." : `${subHeadingTitle || "Real experiences from our valued customers"}`}
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} />)
        ) : items.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Quote className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No testimonials yet</h3>
            <p className="text-gray-500 text-center max-w-md">
              Be the first to share your experience with us!
            </p>
          </div>
        ) : (
          items.map((item, idx) => {
            const imageUrl = getImageUrl(item.Thumbnail);
            const personName = item.PersonName || "Anonymous";
            const jobTitle = item.PersonJobTitle || "";
            const description = item.Description || "No testimonial provided";
            const starCount = item.StarCount || 0;

            return (
              <div
                key={item.Id || idx}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Quote Icon Background */}
                <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-5">
                  <Quote size={120} className="" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Header with Avatar and Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      {
                        imageUrl ? (
                     <img
                        src={imageUrl}
                        alt={personName}
                        className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                      />

                        ):(<img src={IMAGE_URL+"/uploads/logo.png"} alt=""/>)
                      }

                      {/* Verified Badge */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-0.5 truncate">
                        {personName}
                      </h3>
                      {jobTitle && (
                        <p className="text-sm text-gray-600 mb-1.5 truncate">
                          {jobTitle}
                        </p>
                      )}
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        {renderStars(starCount)}
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <Quote size={24} className=" mb-2 opacity-50" />
                    <p className="text-gray-700 leading-relaxed text-sm line-clamp-6 pl-2 italic">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Decorative Gradient Border on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}