import React, { useEffect, useState, useCallback } from "react";
import { Layers, Zap, Shield } from "lucide-react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";



interface Props {
  dataSource: string;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
}

export default function ServiceComp({ dataSource, headingTitle, subHeadingTitle }: Props) {
  const [services, setServices] = useState<any[]>([]);
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
      setServices(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching data";
      console.error(message, err);
      setError(message);
      setServices([]);
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
      : "https://via.placeholder.com/400x300?text=Service";
  }, []);

  const handleNavigation = useCallback(
    (id: string | number) => {
      if (dataSource && id) {
        window.location.href = `/${dataSource}/view/${id}`;
      }
    },
    [dataSource]
  );

  const ServiceSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
      <div className="h-64 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
      <div className="p-8 space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
          <div className="h-4 bg-gray-100 rounded w-4/6" />
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-900 font-bold text-lg">Error Loading Services</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          
          <h1 className={` text-4xl md:text-5xl lg:text-6xl font-bold mb-6`}>
            {headingTitle || "Premium Services We Offer"}
          </h1>
          
          <p className={`text-lg md:text-xl max-w-3xl mx-auto`}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            ) : (
              subHeadingTitle || `Discover ${services.length} professional services tailored to your needs`
            )}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => <ServiceSkeleton key={idx} />)
          ) : services.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Layers className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Services Available</h3>
              <p className="text-gray-500 text-center max-w-md">
                We&apos;re currently updating our services. Please check back soon!
              </p>
            </div>
          ) : (
            services.map((service, idx) => {
              const imageUrl = getImageUrl(service.Thumbnail);
              const title = service.Title || "Service";
              const description = service.Description || "Professional service tailored to your needs";

              return (
                <div
                  key={service.Id || idx}
                  className="group rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleNavigation(service.Id)}
                >
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Service Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <span className="text-sm font-semibold text-gray-800">Service {idx + 1}</span>
                    </div>

                    {/* View Icon */}
                    <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                      <svg className="w-6 h-6 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <h3 className="font-bold text-gray-900 text-2xl mb-4 group-hover: transition-colors duration-300">
                      {title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                      {description}
                    </p>
                    
                    {/* Features or CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className=" font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                        Learn More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      <Shield className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA Section */}
        {!loading && services.length > 0 && (
          <div className="mt-20 text-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              We&apos;re here to help you find the perfect service for your unique requirements
            </p>
            <button 
            onClick={()=>window.location.href="/contact"}
            className="bg-white  px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300">
              Get in Touch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}