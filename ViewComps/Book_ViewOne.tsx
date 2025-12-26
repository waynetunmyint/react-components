"use client";

import React, { useState, useEffect } from "react";
import { ImageIcon, ExternalLink, ShoppingCart } from "lucide-react";
import { IMAGE_URL, SHOW_SHOPPING_CART } from "../../../config";
import { formatPrice, getImageUrl, handleOpenLink } from "../HelperComps/TextCaseComp";
import ImageModal from "../ModalComps/ImageModal";
import { useShoppingCart } from "../ShoppingBookComps/BookCartContext";
import { useToast } from "../UIComps/ToastContext";

// Presentational component — parent should pass full `item` object

interface BookData {
  YoutubeVideoLink?: string;
  ThumbnailOne?: string;
  id?: string | number;
  Id?: string | number;
  BookId?: string | number;
  BooksId?: string | number;
  ThumbnailTwo?: string;
  ThumbnailThree?: string;
  ContactInfoSpecialMessage?: string;
  Thumbnail?: string;
  Title?: string;
  Description?: string;
  BookAuthorTitle?: string;
  BookAuthorId?: string | number;
  BookCategoryTitle?: string;
  BookCategoryId?: string | number;
  PageNumber?: number | string;
  Price?: number;
  Size?: string;
  BookEditionTitle?: string;
  PreviewPDF?: string;
  ContactInfoPhoneOne?: string;
  ContactInfoAddress?: string;
  [key: string]: unknown;
}

interface Props {
  item?: BookData | null;
}


export default function BookViewOne({ item }: Props) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem } = useShoppingCart();
  const { show } = useToast();

  useEffect(() => {
    if (item) {
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [item]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="animate-pulse text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    );
  }


  if (!item)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="max-w-md text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Content Not Found</h3>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 text-white rounded-lg hover:shadow-lg active:scale-95 transition-all font-bold"
            style={{ backgroundColor: 'var(--scolor-contrast)' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const imageUrl = getImageUrl(item.Thumbnail as string | undefined);
  const title = item.Title || "Untitled";
  const description = item.Description || "";



  return (
    <div className="min-h-screen bg-gray-50 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">

          {/* MAIN ROW */}
          <div className="flex md:flex-row flex-col">

            {/* LEFT — IMAGE */}
            <div className="w-full md:w-1/3 bg-gray-100 p-4 flex justify-center">
              <div className="w-full">
                <div className="w-full rounded-lg overflow-hidden shadow">

                  {item?.YoutubeVideoLink ? (
                    <iframe
                      className="w-full aspect-video"
                      src={(item.YoutubeVideoLink as string).replace("watch?v=", "embed/")}
                      title={title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : imageUrl ? (
                    <ImageModal
                      src={IMAGE_URL + "/uploads/" + (item.Thumbnail as string)}
                      alt={title}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={48} />
                      <p className="mt-2 text-xs">No Image</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-row">
                  {item?.ThumbnailOne && item?.ThumbnailOne !== "logo.png" && (
                    <ImageModal
                      src={getImageUrl(item.ThumbnailOne) || ""}
                      alt="Thumbnail One"
                      className="w-1/3 h-20 object-cover mt-3 mr-2 rounded-lg border cursor-pointer"
                    />
                  )}
                  {item?.ThumbnailTwo && item?.ThumbnailTwo !== "logo.png" && (
                    <ImageModal
                      src={getImageUrl(item.ThumbnailTwo) || ""}
                      alt="Thumbnail Two"
                      className="w-1/3 h-20   object-cover mt-3 mr-2 rounded-lg border cursor-pointer"
                    />
                  )}
                  {item?.ThumbnailThree && item?.ThumbnailThree !== "logo.png" && (
                    <ImageModal
                      src={getImageUrl(item.ThumbnailThree) || ""}
                      alt="Thumbnail Three"
                      className="w-1/3 h-20 object-cover mt-3 rounded-lg border cursor-pointer"
                    />
                  )}

                </div>
              </div>
            </div>

            {/* RIGHT — DETAILS */}
            <div className="w-full md:w-2/3 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

              <div className="space-y-3 mb-6">
                {item?.BookAuthorTitle && (
                  <div className="flex">
                    <span className="w-32 text-gray-600 text-sm">စာရေးဆရာ:</span>
                    <a href={`/bookAuthor/view/${item.BookAuthorId}`} className="text-blue-600 hover:underline text-sm font-medium">
                      {item.BookAuthorTitle}
                    </a>
                  </div>
                )}

                {item?.BookCategoryTitle && (
                  <div className="flex">
                    <span className="w-32 text-gray-600 text-sm">အမျိုးအစား:</span>
                    <a href={`/bookCategory/view/${item.BookCategoryId}`} className="text-blue-600 hover:underline text-sm font-medium">
                      {item.BookCategoryTitle}
                    </a>
                  </div>
                )}

                {item?.PageNumber && (
                  <div className="flex">
                    <span className="w-32 text-gray-600 text-sm">စာမျက်နှာ:</span>
                    <span className="text-gray-900 text-sm font-medium">{item.PageNumber}</span>
                  </div>
                )}

                {item?.Price !== undefined && item.Price !== null && (
                  <div className="flex items-center">
                    <span className="w-32 text-gray-600 text-sm">စျေးနူန်:</span>
                    <span>
                      {item.Price === 0 ? (
                        <span className="inline-flex items-center rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--accent-500)] text-white px-2.5 py-1">Free</span>
                      ) : (
                        <span id="page-text-color" className="inline-flex  text-gray-900 items-center  rounded-full  text-sm font-semibold">{formatPrice(item.Price)} MMK</span>
                      )}
                    </span>
                  </div>
                )}

                {item?.Size && (
                  <div className="flex">
                    <span className="w-32 text-gray-600 text-sm">အရွယ်အစား:</span>
                    <span className="text-gray-900 text-sm font-medium">{item.Size}</span>
                  </div>
                )}
                {item?.BookEditionTitle && (
                  <div className="flex">
                    <span className="w-32 text-gray-600 text-sm">ပုံနှိပ်မှတ်တမ်း:</span>
                    <span className="text-gray-900 text-sm font-medium">{item.BookEditionTitle}</span>
                  </div>
                )}
              </div>

              {/* BUTTONS */}
              <div className="flex flex-wrap gap-2 mb-6">
                {item?.PreviewPDF && (
                  <button
                    onClick={() => handleOpenLink(`${IMAGE_URL}/uploads/${item.PreviewPDF}`)}
                    style={{ background: 'var(--accent-500)' }}
                    className="inline-flex items-center px-6 py-3 text-white text-sm font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
                  >
                    <ExternalLink className="inline-block mr-2" size={16} />
                    စာမြည်းဖတ်ရန်
                  </button>
                )}



                {SHOW_SHOPPING_CART && (
                  <button
                    onClick={() => {
                      if (!item) return;
                      addItem({ Id: item.Id, Title: item.Title as string, Price: item.Price as number, Qty: 1, PriceTotal: Number(item.Price) });
                      show('Added to cart');
                    }}
                    style={{ background: 'var(--accent-500)' }}
                    className="inline-flex items-center px-6 py-3 text-white text-sm font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
                  >
                    <ShoppingCart className="inline-block mr-2" size={16} />
                    Add to Cart
                  </button>
                )}



                {item?.ContactInfoSpecialMessage && (
                  <div className="w-full mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <h2 className="text-yellow-800 font-semibold mb-2">Special Message</h2>
                    <p className="text-yellow-700 text-sm whitespace-pre-wrap">{item.ContactInfoSpecialMessage}</p>
                  </div>
                )}
                {/* 
                {data.ContactInfoAddress && (
                  <div className="flex mt-3 w-full">
                    <span className="w-32 text-gray-600 text-sm">စာအုပ်တိုက်လိပ်စာ</span>
                    <span className="text-gray-900 text-sm">{data.ContactInfoAddress}</span>
                  </div>
                )} */}

              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          {description && (
            <div className="border-t border-gray-200 p-6 md:p-8 bg-gray-50">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">Description</h2>

              <div className="relative">
                <div
                  className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap transition-all"
                  style={{
                    maxHeight: showFullDescription ? undefined : '15em',
                    overflow: showFullDescription ? 'visible' : 'hidden',
                  }}
                >
                  {description}
                </div>

                {!showFullDescription && (
                  <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-10 bg-gradient-to-t from-white/95 to-transparent" />
                )}
              </div>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowFullDescription((s) => !s)}
                  className="text-sm  font-medium hover:underline"
                  aria-expanded={showFullDescription}
                >
                  {showFullDescription ? 'View less' : 'View more'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
