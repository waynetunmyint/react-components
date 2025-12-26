
import React from "react";
import { useCachedFetch } from "../_hooks/useCachedFetch";
// import { BookAuthorViewOne } from "./BookAuthor_ViewOne";
// import BookViewOne from "./Book_ViewOne";
import { BASE_URL, PAGE_ID, PAGE_TYPE } from "../../../config";
import BlockSwitcherComp from "../_SwitcherComps/BlockSwitcher";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import BookViewOne from "../ViewComps/Book_ViewOne";
import ProductViewOne from "../ViewComps/Product_ViewOne";
import { BookAuthorViewOne } from "../ViewComps/BookAuthor_ViewOne";
import { ViewOne } from "../ViewComps/ViewOne";
// import { ViewOne } from "./ViewOne";

export interface ChildConfig {
  dataSource: string;
  sectionTitle?: string;
  apiPattern: string;
}

interface Props {
  dataSource: string;
  idField?: string | number;
  styleNo?: number;
  /** Optional custom view component */
  ViewComponent?: React.ComponentType<{ item: any }>;
  /** The child data source for related items (Legacy singular support) */
  childDataSource?: string;
  /** The heading for the related items section (Legacy singular support) */
  childSectionTitle?: string;
  /** The API path pattern for fetching related child items (Legacy singular support) */
  childApiPattern?: string;
  /** Multiple child data sources for related items */
  childrenConfigs?: ChildConfig[];
}

export default function ViewSwitcher({
  dataSource,
  idField,
  styleNo,
  ViewComponent,
  childDataSource,
  childSectionTitle,
  childApiPattern,
  childrenConfigs = []
}: Props) {
  // Build API URL
  // Build API URL
  const url = dataSource
    ? (PAGE_TYPE === "standalone"
      ? `${BASE_URL}/${dataSource}/api/${idField}`
      : `${BASE_URL}/${dataSource}/api/byPageId/view/${PAGE_ID}/${idField}`)
    : null;

  // Use cached fetch with stale-while-revalidate pattern
  const { data: item, loading, error, isFromCache } = useCachedFetch(url, {
    cacheTime: 10 * 60 * 1000,
  });

  if (loading && !item) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--theme-primary-bg)]"></div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="p-10 text-center text-red-500">
        <p className="font-bold">Error loading content</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!item && !loading) {
    return <div className="p-10 text-center">Item not found</div>;
  }

  // Determine which component to use for the parent item
  let ParentView;
  if (ViewComponent) {
    ParentView = <ViewComponent item={item} />;
  } else {
    const displayStyle = dataSource + (styleNo ?? 0).toString();
    switch (displayStyle) {
      case "book1": ParentView = <BookViewOne item={item} />; break;
      case "product1": ParentView = <ProductViewOne item={item} />; break;
      case "bookAuthor1": ParentView = <BookAuthorViewOne item={item} />; break;
      // University 16 uses CommonViewOne for detail, but UniversitySixteen for children
      case "university16": ParentView = <ViewOne item={item} />; break;
      default: ParentView = <ViewOne item={item} />;
    }
  }

  // Combine legacy singular child and new array
  const allChildren: ChildConfig[] = [...childrenConfigs];
  if (childDataSource && childApiPattern) {
    allChildren.unshift({
      dataSource: childDataSource,
      sectionTitle: childSectionTitle,
      apiPattern: childApiPattern
    });
  }

  return (
    <div className="view-cms-container">
      <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>
      {/* Parent Content */}
      {ParentView}

      {/* Related Child Items */}
      {allChildren.map((child, index) => {
        const itemId = item?.Id || item?.id || item?.ID || idField;
        let childApiUrl = child.apiPattern || "";

        if (item && childApiUrl) {
          childApiUrl = childApiUrl
            .replace(/{PAGE_ID}/gi, String(PAGE_ID))
            .replace(/{ITEM_ID}/gi, String(itemId));
        }

        const sectionTitle = child.sectionTitle || `Related ${child.dataSource}s`;

        if (!child.dataSource || !childApiUrl) return null;

        return (
          <div key={`${child.dataSource}-${index}`} className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100 last:border-b-0">
            <BlockSwitcherComp
              headingTitle={sectionTitle}
              customAPI={childApiUrl}
              dataSource={child.dataSource}
              styleNo={child.dataSource === 'university' ? 16 : 1}
            />
          </div>
        );
      })}
    </div>
  );
}


