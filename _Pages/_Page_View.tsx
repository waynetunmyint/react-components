import React from "react";
import { IonContent, IonPage } from '@ionic/react';
import { ArrowRight, RefreshCw } from "lucide-react";
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import { FOOTER_STYLE, BASE_URL, PAGE_ID, PAGE_TYPE } from '../../../config';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import BlockSwitcherComp from "../_SwitcherComps/BlockSwitcher";
import { useCachedPaginatedFetch } from "../_hooks/useCachedPaginatedFetch";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Item extends Record<string, any> {
  Id?: string;
  id?: string;
  Title?: string;
  BrandName?: string;
  Thumbnail?: string;
  Description?: string;
  CreatedAt?: string;
}

interface Props {
  dataSource: string;
  headingTitle?: string;
  subHeadingTitle?: string;
}

const PageView: React.FC<Props> = ({ dataSource, headingTitle, subHeadingTitle }) => {
  const displayTitle = headingTitle || dataSource.charAt(0).toUpperCase() + dataSource.slice(1);

  // Hook appends page number automatically, e.g. /1, /2, etc.
  const url = dataSource
    ? (PAGE_TYPE === "standalone"
      ? `${BASE_URL}/${dataSource}/api/byPage/isInteresting`
      : `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}`)
    : null;

  const {
    items: displayedItems,
    loading,
    error,
    loadMore: handleLoadMore,
    refresh: getData,
  } = useCachedPaginatedFetch<Item>(url, {
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    itemsPerPage: 12,
  });

  // We consider we have more if loading or if we have items
  // In a real scenario, useCachedPaginatedFetch should return hasMore
  const hasMoreItems = true;

  return (
    <IonPage>
      <IonContent fullscreen>
        <HeaderSwitcher headingField={displayTitle} />
        <div className='min-h-screen bg-[#0d0d21]'>
          <div className="max-w-7xl mx-auto py-12 md:py-20">

            <BlockSwitcherComp
              dataSource={dataSource}
              styleNo={1}
              items={displayedItems}
              loading={loading}
              error={error}
              headingTitle={headingTitle}
              subHeadingTitle={subHeadingTitle}
            />

            {/* Pagination Controls */}
            {!error && displayedItems.length > 0 && (
              <div className="mt-20 flex justify-center px-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full max-w-md py-5 bg-[var(--accent-500)] text-[#090918] font-black text-lg rounded-[24px] shadow-[0_20px_40px_rgba(255,204,51,0.2)] hover:shadow-[0_25px_50px_rgba(255,204,51,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4 group"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={24} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Entries
                      <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error State Retry */}
            {error && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => getData()}
                  className="px-8 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Retry Loading
                </button>
              </div>
            )}
          </div>
        </div>
        <FooterSwitchComp styleNo={FOOTER_STYLE} />
      </IonContent>
    </IonPage>
  );
};

export default PageView;