import React, { useState, useEffect } from "react";
import ContactViewNineOne from "../ContactComps/ContactViewNineOne";
import { ContactViewOne } from "../ViewComps/Contact_ViewOne";
import { BASE_URL, PAGE_ID } from "../../../config";


interface Props {
  styleNo?: number;
  contactData?: any;
}

export default function ContactViewSwitcher({
  styleNo,
  contactData
}: Props) {
  // Keep `view` null until a valid `styleNo` arrives so caller
  // can asynchronously provide it (e.g. loaded from DB/settings).
  const [view, setView] = useState<number | null>(
    styleNo !== undefined && styleNo !== null ? Number(styleNo) : null
  );
  useEffect(() => {
    if (styleNo !== undefined && styleNo !== null) {
      setView(Number(styleNo));
    }
  }, [styleNo]);
  const common = {
  };

  const renderVariant = () => {
    switch (view) {

      case 0: return <></>;
      case 1: return <ContactViewOne item={item} {...common} />;

      default:
        return <ContactViewOne item={item} {...common} />;
    }
  };



  const [item, setItem] = useState<any>(null);
  const CACHE_KEY = `contact_info_${PAGE_ID}`;

  useEffect(() => {
    // If contactData prop is provided (even if null initially), wait for it
    if (contactData !== undefined) {
      setItem(contactData);
      return;
    }

    // Only use cache/fetch if no contactData prop is being managed by parent
    // 1. Try to load from cache immediately
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        setItem(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached contact info", e);
      }
    }

    // 2. Fetch fresh data
    fetchData();
  }, [contactData]);

  const fetchData = async () => {
    try {
      const url = `${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`;
      console.log("[ContactViewSwitcher] Fetching:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch contact info. Status: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("[ContactViewSwitcher] Fetched result:", result);

      const data = Array.isArray(result) ? result[0] : result;

      if (data) {
        setItem(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } else {
        console.warn("[ContactViewSwitcher] Received empty data from API");
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching data";
      console.error("[ContactViewSwitcher] Error:", message, err);
      // Keep existing item or cache if available
    }
  };

  // If `view` is still null, wait — show a simple skeleton placeholder.
  if (view === null) {
    return (
      <div id="page-skeleton-footer">
        <div className="animate-pulse">
          <div className="h-40 bg-page border-page rounded-md" />
        </div>
      </div>
    );
  }

  return <div>{renderVariant()}</div>;
}