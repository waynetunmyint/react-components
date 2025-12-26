import React, { useState, useEffect } from "react";
import { BASE_URL, PAGE_ID, PAGE_TYPE } from "../../../config";

import SliderOne from "../SliderComps/SliderOne";
import SliderTwo from "../SliderComps/SliderTwo";
import SliderThree from "../SliderComps/SliderThree";
import SliderFour from "../SliderComps/SliderFour";
import SliderFive from "../SliderComps/SliderFive";
import SliderTwelve from "../SliderComps/SliderTwelve";

import CommonOne from "../BlockComps/CommonOne";
import BookOne from "../BlockComps/BookOne";
import BrandOne from "../BlockComps/BrandOne";
import ClientOne from "../BlockComps/ClientOne";
import AdvantageOne from "../BlockComps/AdvantageOne";
import ArticleOne from "../BlockComps/ArticleOne";
import AuthorBlockNineOne from "../BlockComps/AuthorBlockNineOne";
import AuthorOne from "../BlockComps/AuthorOne";
import BookBlockNineOne from "../BlockComps/BookBlockNineOne";
import Display_Block_Nine from "../BlockComps/Display_Block_Nine";
import GridBlockNineOne from "../BlockComps/GridBlockNineOne";
import GridBlockNineTwo from "../BlockComps/GridBlockNineTwo";
import ProductBlockNineOne from "../BlockComps/ProductBlockNineOne";
import ServiceBlockNineOne from "../BlockComps/ServiceBlockNineOne";
import AboutBlockNineOne from "../BlockComps/AboutBlockNineOne";
import BookAuthorSix from "../BlockComps/BookAuthorSix";

import TestimonialTwelve from "../TestimonialComps/TestimonialTwelve";
import TestimonialOne from "../TestimonialComps/TestimonialOne";
import CourseTwelve from "../CourseComps/CourseTwelve";
import AddressSixteen from "../AddressComps/AddressSixteen";
import SliderSix from "../SliderComps/SliderSix";
import ArticleEleven from "../ArticleComps/ArticleEleven";
import BlockOne from "../BlockComps/BlockOne";

interface Props {
  dataSource: string;
  styleNo?: number;
  headingTitle?: string | null;
  subHeadingTitle?: string | null;
  displayType?: string;
  customAPI?: string;
  // External data props
  items?: any[];
  loading?: boolean;
  error?: string | null;
}

const FRESH_MS = 5 * 60 * 1000; // 5 min = fresh, skip fetch

export default function BlockSwitcherComp({
  dataSource,
  styleNo = 1,
  headingTitle,
  subHeadingTitle,
  displayType,
  customAPI,
  items: externalItems,
  loading: externalLoading,
  error: externalError,
}: Props) {
  const [internalItems, setInternalItems] = useState<any[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);

  const cacheKey = `blk_${dataSource}_${PAGE_ID}_${customAPI ? customAPI.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 32) : 'std'}`;

  // Prioritize external data if provided
  const items = externalItems ?? internalItems;
  const loading = externalLoading ?? (externalItems ? false : internalLoading);
  const error = externalError ?? internalError;

  useEffect(() => {
    // If external items are provided, we don't need to fetch internally
    if (externalItems) {
      setInternalLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      // 1. Show cached data immediately
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const { d, t } = JSON.parse(raw);
          if (Array.isArray(d) && d.length) {
            setInternalItems(d);
            setInternalLoading(false);
            if (Date.now() - t < FRESH_MS) return; // Still fresh, skip fetch
          }
        }
      } catch {
        localStorage.removeItem(cacheKey);
      }

      // 2. Fetch fresh data
      try {
        const url = customAPI
          ? (customAPI.startsWith('http') ? customAPI : `${BASE_URL}${customAPI.startsWith('/') ? '' : '/'}${customAPI}`)
          : PAGE_TYPE === "standalone"
            ? (dataSource === "article"
              ? `${BASE_URL}/${dataSource}/api/byPage/isInteresting/1`
              : `${BASE_URL}/${dataSource}/api/byPageId/byPage/`)
            : `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}/1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];

        if (!cancelled) {
          localStorage.setItem(cacheKey, JSON.stringify({ d: arr, t: Date.now() }));
          setInternalItems(arr);
          setInternalError(null);
        }
      } catch (e: any) {
        if (!cancelled && !internalItems.length) setInternalError(e.message || "Fetch error");
      } finally {
        if (!cancelled) setInternalLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dataSource, customAPI, cacheKey, externalItems]);

  const common = {
    dataSource,
    headingTitle: headingTitle ?? undefined,
    subHeadingTitle: subHeadingTitle ?? undefined,
    displayType: displayType ?? "normal",
    customAPI,
    items,
    loading,
    error,
  };

  if (loading && (!items || items.length === 0)) {
    return (
      <div className="w-full min-h-[300px] flex items-center justify-center bg-gray-50 rounded-lg animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const key = `${dataSource}${styleNo}`;
  const variants: Record<string, React.ReactNode> = {
    // Advantage
    advantage1: <AdvantageOne {...common} />,

    // Address
    address16: <AddressSixteen {...common} />,

    // Slider
    slider1: <SliderOne {...common} />,
    slider2: <SliderTwo {...common} />,
    slider3: <SliderThree {...common} />,
    slider4: <SliderFour {...common} />,
    slider5: <SliderFive {...common} />,
    slider6: <SliderSix {...common} />,
    // Course
    course12: <CourseTwelve {...common} />,

    // Custom Sliders
    customSlider1: <CommonOne {...common} />,
    customSlider12: <SliderTwelve {...common} />,
    customSlider21: <SliderTwelve {...common} />,
    customSlider212: <SliderTwelve {...common} />,

    // Book
    book1: <BookOne {...common} />,
    book6: <BookAuthorSix {...common} />,

    // Client/Page
    page1: <ClientOne {...common} />,

    // Testimonial
    testimonial1: <TestimonialOne {...common} />,
    testimonial12: <TestimonialTwelve {...common} />,

    // Brand
    brand1: <BrandOne {...common} />,

    author91: <AuthorBlockNineOne {...common} />,
    book91: <BookBlockNineOne {...common} />,
    display91: <Display_Block_Nine {...common} />,
    grid91: <GridBlockNineOne {...common} />,
    grid92: <GridBlockNineTwo {...common} />,
    product91: <ProductBlockNineOne {...common} />,
    service91: <ServiceBlockNineOne {...common} />,
    about91: <AboutBlockNineOne {...common} />,

    // Author
    author1: <AuthorOne {...common} />,
  };

  if (styleNo === null || styleNo === undefined) {
    return <div className="animate-pulse"><div className="h-40 bg-gray-100 rounded-md" /></div>;
  }

  return <>{variants[key] ?? <BlockOne {...common} />}</>;
}
