import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  brandId: string | number;
  customAPI: string;
}

interface Brand {
  Id: number;
  Thumbnail?: string;
  Title?: string;
  Description?: string;
}

interface Product {
  Id: number;
  Thumbnail?: string;
  Title?: string;
  Description?: string;
  Price?: number;
}

export default function BrandViewCompOne({ brandId, customAPI }: Props) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getBrandData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}${customAPI}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch brand: ${response.status}`);
      }

      const result = await response.json();
      setBrand(result[0] || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching brand";
      console.error(message, err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [customAPI]);

  const getProducts = useCallback(async () => {
    try {
      setProductsLoading(true);

      const response = await fetch(`${BASE_URL}/product/api/byBrand/${brandId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const result = await response.json();
      const data = Array.isArray(result) ? result : [];
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    getBrandData();
    getProducts();
  }, [getBrandData, getProducts]);

  const getImageUrl = useCallback((thumbnail: string | undefined) => {
    if (!thumbnail) {
      return "https://via.placeholder.com/1200x600?text=No+Image";
    }
    // Remove duplicate IMAGE_URL prefix if it exists
    const cleanThumbnail = thumbnail.startsWith(IMAGE_URL) 
      ? thumbnail.replace(IMAGE_URL, '').replace(/^\/uploads\//, '')
      : thumbnail;
    return `${IMAGE_URL}/uploads/${cleanThumbnail}`;
  }, []);

  const handleProductClick = useCallback((productId: number) => {
    window.location.href = `/product/view/${productId}`;
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border-l-4 border-red-500 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-900 font-bold text-lg">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Hero Skeleton */}
        <div className="relative h-[60vh] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>
        
        {/* Products Skeleton */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="h-10 bg-gray-200 rounded-lg w-64 mb-12 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="w-full h-64 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Brand not found</h2>
          <p className="text-gray-600">The brand you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const brandImageUrl = getImageUrl(brand.Thumbnail);

  return (
    <div className="min-h-screen  -mx-5 -mt-5">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={brandImageUrl}
            alt={brand.Title || "Brand"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Brand+Image";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-16">
          <div className="max-w-4xl">
            {/* Brand Logo/Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
              {brand.Title || "Brand"}
            </h1>

            {/* Description */}
            {brand.Description && (
              <p className="text-xl md:text-2xl text-white/90 line-clamp-4 leading-relaxed drop-shadow-lg">
                {brand.Description}
              </p>
            )}
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Our Products
          </h2>
          <p className="text-gray-600 text-lg">
            {productsLoading 
              ? "Loading products..." 
              : products.length === 0 
                ? "No products available" 
                : `Discover ${products.length} amazing ${products.length === 1 ? 'product' : 'products'}`
            }
          </p>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="w-full h-64 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              This brand hasn't added any products yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product, idx) => {
              const productImageUrl = getImageUrl(product.Thumbnail);
              
              return (
                <div
                  key={product.Id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl 
                    transition-all duration-500 cursor-pointer hover:-translate-y-2"
                  onClick={() => handleProductClick(product.Id)}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${idx * 50}ms forwards`,
                    opacity: 0
                  }}
                >
                  {/* Product Image */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    <img
                      src={productImageUrl}
                      alt={product.Title || "Product"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "https://via.placeholder.com/400x400?text=Product";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover: transition-colors">
                      {product.Title || "Untitled Product"}
                    </h3>
                    
                    {product.Description && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {product.Description}
                      </p>
                    )}

                    {product.Price !== undefined && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-2xl font-bold text-gray-900">
                          ${product.Price.toFixed(2)}
                        </span>
                        <div className=" font-medium text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}