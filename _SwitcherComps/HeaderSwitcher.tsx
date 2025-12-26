import { useState, useEffect, useCallback, useMemo } from "react";
import { Book } from "lucide-react";
import * as AllIcons from "lucide-react";
import HeaderOne from "../HeaderComps/HeaderOne";
import HeaderTwo from "../HeaderComps/HeaderTwo";
import HeaderThree from "../HeaderComps/HeaderThree";
import HeaderFour from "../HeaderComps/HeaderFour";
import HeaderFive from "../HeaderComps/HeaderFive";
import HeaderSix from "../HeaderComps/HeaderSix";
import HeaderSeven from "../HeaderComps/HeaderSeven";
import HeaderEight from "../HeaderComps/HeaderEight";
import HeaderNine from "../HeaderComps/HeaderNine";
import HeaderSixteen from "../HeaderComps/HeaderSixteen";
import { BASE_URL, PAGE_ID, HEADER_STYLE } from "../../../config";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  label: string;
  url: string;
  icon: LucideIcon;
  hasSubmenu?: boolean;
  isMegaMenu?: boolean; // 1 = Mega Menu (Grid), 0 = Simple List
  key?: string;
  raw?: any;
}

export interface DropdownConfig {
  key: string;
  title: string;
  apiEndpoint: string;
  urlPattern: string;
  idField: string;
  titleField: string;
  thumbnailField: string;
  isMegaMenu?: boolean;
}

export interface HeaderProps {
  headingField?: string;
  showRightButtons?: boolean;
  menuItems: MenuItem[];
  contactData: any;
  finalDropdowns: DropdownConfig[];
  dropdownData: Record<string, any[]>;
  dropdownLoading: Record<string, boolean>;
  fetchDropdownItems: (key: string, endpoint: string) => Promise<void>;
  dropdownStyle?: string;
}

interface Props {
  menuItems?: MenuItem[];
  dropdownConfigs?: DropdownConfig[];
  headingField?: string;
  showRightButtons?: boolean;
  dropdownStyle?: string;
}

export default function HeaderSwitcher({
  menuItems: manualMenuItems = [],
  dropdownConfigs = [],
  headingField,
  showRightButtons = true,
  dropdownStyle = "default",
}: Props) {
  const [fetchedMenuItems, setFetchedMenuItems] = useState<MenuItem[]>([]);
  const [contactData, setContactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // API STATES FOR ALL DROPDOWNS
  const [dropdownData, setDropdownData] = useState<Record<string, any[]>>({});
  const [dropdownLoading, setDropdownLoading] = useState<Record<string, boolean>>({});

  /** =========================
   *   NORMALIZE KEY
   * ========================== */
  const normalizeKey = useCallback((label: string, url?: string) => {
    if (url && url.startsWith('/') && !url.includes('/view/')) {
      const parts = url.split('/').filter(Boolean);
      if (parts.length === 1) return parts[0];
    }
    return label
      .trim()
      .toLowerCase()
      .replace(/ies$/, "y")
      .replace(/s$/, "")
      .replace(/\s+/g, "-");
  }, []);

  /** =========================
   *   FETCH MENU & CONTACT
   * ========================== */
  useEffect(() => {
    const fetchMenu = async () => {
      const CACHE_KEY = `StoredHeaderMenu_${PAGE_ID}_v2`;
      const CONTACT_CACHE_KEY = `StoredContactInfo_${PAGE_ID}`;

      const mapItems = (items: any[]): MenuItem[] =>
        items.map((item: any) => {
          const iconName = item.Icon?.trim();
          let ResolvedIcon = Book;

          if (iconName) {
            if ((AllIcons as any)[iconName]) {
              ResolvedIcon = (AllIcons as any)[iconName];
            } else {
              const foundKey = Object.keys(AllIcons).find(
                (key) => key.toLowerCase() === iconName.toLowerCase()
              );
              if (foundKey) {
                ResolvedIcon = (AllIcons as any)[foundKey];
              }
            }
          }

          const url = item.LinkURL;
          const label = item.Title;
          const menuKey = normalizeKey(label, url);

          return {
            label,
            url,
            icon: ResolvedIcon,
            hasSubmenu: item.IsDropdown === 1 || item.IsDropdown === '1',
            isMegaMenu: item.IsMegaMenu === undefined || item.IsMegaMenu === null ? true : (item.IsMegaMenu === 1 || item.IsMegaMenu === '1'),
            key: menuKey,
            raw: item,
          };
        });

      // 1. Try cache
      const storedMenu = localStorage.getItem(CACHE_KEY);
      if (storedMenu) {
        try {
          const parsed = JSON.parse(storedMenu);
          if (parsed && parsed.items) setFetchedMenuItems(mapItems(parsed.items));
        } catch (e) { }
      }
      const storedContact = localStorage.getItem(CONTACT_CACHE_KEY);
      if (storedContact) {
        try {
          const parsed = JSON.parse(storedContact);
          if (parsed) setContactData(parsed);
        } catch (e) { }
      }

      // 2. Background Fetch
      try {
        const headerMenuURL = `${BASE_URL}/headerMenu/api/byPageId/${PAGE_ID}`;
        const contactInfoURL = `${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`;
        const [menuRes, contactRes] = await Promise.all([
          fetch(headerMenuURL),
          fetch(contactInfoURL)
        ]);

        const menuData = await menuRes.json();
        const contactDataRaw = await contactRes.json();

        // console.log("Menu Data", menuData, headerMenuURL, contactInfoURL);

        const menuItemsArr = Array.isArray(menuData) ? menuData : menuData.rows || [];
        const contactObj = contactDataRaw?.[0] || null;

        setFetchedMenuItems(mapItems(menuItemsArr));
        setContactData(contactObj);

        localStorage.setItem(CACHE_KEY, JSON.stringify({ items: menuItemsArr, timestamp: Date.now() }));
        localStorage.setItem(CONTACT_CACHE_KEY, JSON.stringify(contactObj));
      } catch (err) {
        console.error("Failed to fetch header data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const finalMenuItems = useMemo(() => {
    const items = fetchedMenuItems.length > 0 ? fetchedMenuItems : manualMenuItems;
    return items.map(m => ({
      ...m,
      key: m.key || normalizeKey(m.label, m.url)
    }));
  }, [fetchedMenuItems, manualMenuItems, normalizeKey]);

  /** =========================
   *   FINAL DROPDOWN CONFIGS
   * ========================== */
  const finalDropdowns = useMemo(() => {
    const auto = finalMenuItems
      .filter((m) => m.hasSubmenu)
      .map((m) => {
        const key = m.key!;
        return {
          key,
          title: m.label,
          apiEndpoint: `/${key}/api/byPageId/${PAGE_ID}`,
          urlPattern: `/${key}/view/{id}`,
          idField: "Id",
          titleField: "Title",
          thumbnailField: "Thumbnail",
          isMegaMenu: m.isMegaMenu
        };
      });

    const manualKeys = dropdownConfigs.map((x) => x.key);
    const autoFiltered = auto.filter((a) => !manualKeys.includes(a.key));

    return [...autoFiltered, ...dropdownConfigs];
  }, [finalMenuItems, dropdownConfigs]);

  /** =========================
   *   FETCH DROPDOWN DATA
   * ========================== */
  const fetchDropdownItems = useCallback(async (key: string, endpoint: string) => {
    const CACHE_KEY = `dropdown_cache_${key}_${PAGE_ID}`;
    let hasCache = false;

    // 1. Check local data first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setDropdownData(prev => ({ ...prev, [key]: parsed }));
          hasCache = true;
        }
      } catch (e) { }
    }

    if (!hasCache) {
      setDropdownLoading(prev => ({ ...prev, [key]: true }));
    }

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      const data = await res.json();
      const items = data || [];

      localStorage.setItem(CACHE_KEY, JSON.stringify(items));
      setDropdownData(prev => ({ ...prev, [key]: items }));
    } catch (e) {
      console.error("Dropdown fetch error", e);
      if (!hasCache) {
        setDropdownData(prev => ({ ...prev, [key]: [] }));
      }
    } finally {
      setDropdownLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  const common: HeaderProps = {
    menuItems: finalMenuItems,
    headingField,
    showRightButtons,
    contactData,
    finalDropdowns,
    dropdownData,
    dropdownLoading,
    fetchDropdownItems,
    dropdownStyle,
  };

  const renderVariant = () => {
    const style = HEADER_STYLE as number;
    switch (style) {
      case 1: return <HeaderOne {...common} />;
      case 2: return <HeaderTwo {...common} />;
      case 3: return <HeaderThree {...common} />;
      case 4: return <HeaderFour {...common} />;
      case 5: return <HeaderFive {...common} />;
      case 6: return <HeaderSix {...common} />;
      case 7: return <HeaderSeven {...common} />;
      case 8: return <HeaderEight {...common} />;
      case 9: return <HeaderNine {...common} />;
      case 16: return <HeaderSixteen {...common} />;
      default: return <HeaderOne {...common} />;
    }
  };

  if (isLoading && !contactData) {
    // Optionally return a minimalist loader or nothing to avoid layouts jumps
    return null;
  }

  return <div>{renderVariant()}</div>;
}