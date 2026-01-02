import { useState, useEffect, useRef, useMemo } from "react";
import { Menu, X, LucideIcon } from "lucide-react";
import { useHistory, useLocation } from "react-router-dom";
import { IMAGE_URL, BASE_URL, PAGE_ID } from "@/config";

/* -------------------------------------------------------------------------- */
/*                                Types                                       */
/* -------------------------------------------------------------------------- */

export interface MenuItem {
    label: string;
    url: string;
    icon: LucideIcon;
    hasSubmenu?: boolean;
}

export interface DropdownConfig {
    key: string; // e.g., "brands"
    title: string; // e.g., "Brands"
    apiEndpoint: string; // e.g., "/brand/api"
    urlPattern: string; // e.g., "/brand/view/{id}"
    idField?: string; // default: "Id"
    titleField?: string; // default: "Title"
    thumbnailField?: string; // default: "Thumbnail"
    descriptionField?: string; // default: "Description"
}

interface HeaderProps {
    headingField?: string;
    showRightButtons?: boolean;
    logoThumbnail?: string;
    contactInfoApiEndpoint?: string;
    menuItems: MenuItem[];
    dropdownConfigs?: DropdownConfig[];
}

/* -------------------------------------------------------------------------- */
/*                                Hooks                                       */
/* -------------------------------------------------------------------------- */

// Normalize labels for key matching (e.g., "Brands" -> "brand")
const normalizeKey = (label: string) => {
    let k = label.trim().toLowerCase();
    if (k.endsWith("ies")) k = k.replace(/ies$/, "y");
    else if (k.endsWith("s") && !k.endsWith("ss")) k = k.slice(0, -1);
    return k.replace(/\s+/g, "-");
};

function useDropdownConfigs(menuItems: MenuItem[], manualConfigs: DropdownConfig[]) {
    return useMemo(() => {
        const autoDropdownConfigs = menuItems
            .filter((item) => item.hasSubmenu)
            .map((item) => {
                const key = normalizeKey(item.label);
                return {
                    key,
                    title: item.label.charAt(0) + item.label.slice(1).toLowerCase(),
                    apiEndpoint: `/${key}/api/byPageId/${PAGE_ID}`,
                    urlPattern: `/${key}/view/{id}`,
                    idField: "Id",
                    titleField: "Title",
                    thumbnailField: "Thumbnail",
                    descriptionField: "Description",
                };
            });

        // Merge manual configs (manual takes precedence)
        const mergedAuto = autoDropdownConfigs.filter((auto) =>
            !manualConfigs.some((manual) => {
                if (manual.key === auto.key) return true;
                if (manual.key === `${auto.key}s`) return true;
                if (manual.key === auto.key.replace(/s$/, "")) return true;
                return false;
            })
        );

        return [...mergedAuto, ...manualConfigs];
    }, [menuItems, manualConfigs]);
}

function useDropdownData(configs: DropdownConfig[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<{ [key: string]: any[] }>({});
    const fetchedKeys = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (configs.length === 0) return;

        const toFetch = configs.filter((cfg) => !fetchedKeys.current.has(cfg.key));
        if (toFetch.length === 0) return;

        const controller = new AbortController();

        const fetchAll = async () => {
            const promises = toFetch.map(async (config) => {
                try {
                    const res = await fetch(`${BASE_URL}${config.apiEndpoint}`, {
                        signal: controller.signal,
                    });
                    if (!res.ok) throw new Error(`Failed to fetch ${config.key}`);
                    const json = await res.json();
                    return { key: config.key, data: json };
                } catch (err) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    if ((err as any).name !== "AbortError") {
                        console.error(err);
                    }
                    return { key: config.key, data: [] };
                }
            });

            const results = await Promise.all(promises);
            setData((prev) => {
                const next = { ...prev };
                results.forEach(({ key, data }) => {
                    next[key] = data;
                    fetchedKeys.current.add(key);
                });
                return next;
            });
        };

        fetchAll();

        return () => controller.abort();
    }, [configs]);

    return data;
}

function useContactInfo(endpoint?: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [info, setInfo] = useState<any>(null);

    useEffect(() => {
        if (!endpoint) return;
        fetch(`${BASE_URL}${endpoint}`)
            .then((res) => res.json())
            .then((data) => setInfo(data[0]))
            .catch((err) => console.error("Error fetching contact info:", err));
    }, [endpoint]);

    return info;
}

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function Header({
    headingField,
    showRightButtons = true,
    logoThumbnail,
    contactInfoApiEndpoint,
    menuItems,
    dropdownConfigs = [],
}: HeaderProps) {
    const history = useHistory();
    const location = useLocation();
    const currentPath = location.pathname;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const finalDropdownConfigs = useDropdownConfigs(menuItems, dropdownConfigs);
    const dropdownData = useDropdownData(finalDropdownConfigs);
    const contactInfo = useContactInfo(contactInfoApiEndpoint);

    const logoUrl = logoThumbnail
        ? `${IMAGE_URL}/uploads/${logoThumbnail}`
        : contactInfo?.Thumbnail
            ? `${IMAGE_URL}/uploads/${contactInfo.Thumbnail}`
            : undefined;

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickInside = Object.values(dropdownRefs.current).some(
                (ref) => ref && ref.contains(event.target as Node)
            );
            if (!isClickInside) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNavigation = (url: string) => {
        history.push(url);
        setIsMenuOpen(false);
        setOpenDropdown(null);
    };

    const toggleDropdown = (key: string) => {
        setOpenDropdown((prev) => (prev === key ? null : key));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDropdownItemClick = (config: DropdownConfig, item: any) => {
        const idField = config.idField || "Id";
        const itemId = item[idField];
        const url = config.urlPattern.replace("{id}", itemId);
        handleNavigation(url);
    };

    return (
        <header
            id="page-header"
            className="sticky top-0 z-40 border-b border-white/10 shadow-xl backdrop-blur-md bg-black/40 transition-all duration-300 transform"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-40">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Left - Logo & Title */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => history.push("/")}>
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-xl blur-md bg-white/10 group-hover:bg-white/20 transition-all"></div>
                            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-white/10 bg-black/20">
                                {logoUrl && (
                                    <img
                                        src={logoUrl}
                                        alt="logo"
                                        className="w-full h-full object-contain p-1"
                                    />
                                )}
                            </div>
                        </div>

                        {headingField && (
                            <div className="hidden sm:block text-white">
                                <h1 className="text-lg md:text-xl font-bold tracking-tight">
                                    {headingField}
                                </h1>
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    {showRightButtons && (
                        <nav className="hidden md:flex items-center gap-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const normalize = normalizeKey(item.label);
                                const submenuKey = item.hasSubmenu
                                    ? finalDropdownConfigs.find((d) => normalize.includes(d.key))?.key
                                    : undefined;
                                const isDropdownOpen = openDropdown === submenuKey;
                                const isActive = currentPath === item.url && !item.hasSubmenu;

                                if (submenuKey) {
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => toggleDropdown(submenuKey)}
                                            className={`
                        group relative flex items-center gap-2 px-4 py-2 rounded-lg
                        text-sm font-medium transition-all duration-200
                        ${isDropdownOpen ? "text-white bg-white/20 shadow-inner" : "text-white/80 hover:text-white hover:bg-white/10"}
                      `}
                                        >
                                            <Icon
                                                size={18}
                                                className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-3" : "group-hover:scale-110"}`}
                                            />
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                }

                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => handleNavigation(item.url)}
                                        className={`
                      group relative flex items-center gap-2 px-4 py-2 rounded-lg
                      text-sm font-medium transition-all duration-200
                      ${isActive ? "text-white bg-white/20 shadow-inner" : "text-white/80 hover:text-white hover:bg-white/10"}
                    `}
                                    >
                                        <Icon
                                            size={18}
                                            className={`transition-transform duration-200 ${isActive ? "" : "group-hover:scale-110"}`}
                                        />
                                        <span>{item.label}</span>
                                        {isActive && (
                                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full shadow-glow"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    )}

                    {/* Mobile Menu Toggle */}
                    {showRightButtons && (
                        <button
                            className={`
                md:hidden relative p-2 rounded-lg text-white
                transition-all duration-200
                hover:bg-white/10 active:scale-95
                ${isMenuOpen ? "bg-white/10" : ""}
              `}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <div className="relative w-6 h-6">
                                {/* Animated Menu/X Icon */}
                                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}>
                                    <Menu size={24} />
                                </span>
                                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}>
                                    <X size={24} />
                                </span>
                            </div>
                        </button>
                    )}
                </div>

                {/* Mobile Navigation Menu */}
                <div
                    className={`
            md:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isMenuOpen ? "max-h-screen opacity-100 pb-4" : "max-h-0 opacity-0"}
          `}
                >
                    <nav className="flex flex-col gap-2 pt-2 border-t border-white/5">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const normalize = normalizeKey(item.label);
                            const submenuKey = item.hasSubmenu
                                ? finalDropdownConfigs.find((d) => normalize.includes(d.key))?.key
                                : undefined;
                            const isDropdownOpen = openDropdown === submenuKey;
                            const isActive = currentPath === item.url;

                            const style = { transitionDelay: isMenuOpen ? `${index * 50}ms` : "0ms" };
                            const baseClass = "flex items-center gap-3 py-3 px-4 rounded-xl text-left font-medium transition-all duration-300 transform translate-x-0";
                            const openClass = "translate-x-0 opacity-100";
                            const closedClass = "-translate-x-4 opacity-0"; // Handled by parent height mainly, but visuals help

                            if (submenuKey) {
                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => toggleDropdown(submenuKey)}
                                        style={style}
                                        className={`
                      ${baseClass}
                      ${isDropdownOpen ? "bg-white/20 text-white shadow-md ring-1 ring-white/10" : "text-white/80 hover:bg-white/10 hover:text-white"}
                    `}
                                    >
                                        <div className={`p-2 rounded-lg transition-colors ${isDropdownOpen ? "bg-red-500/20 text-red-300" : "bg-white/5"}`}>
                                            <Icon size={20} />
                                        </div>
                                        <span className="flex-1">{item.label}</span>
                                    </button>
                                )
                            }

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleNavigation(item.url)}
                                    style={style}
                                    className={`
                    ${baseClass}
                    ${isActive ? "bg-white/20 text-white shadow-md ring-1 ring-white/10" : "text-white/80 hover:bg-white/10 hover:text-white"}
                  `}
                                >
                                    <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-red-500/20 text-red-300" : "bg-white/5"}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="flex-1">{item.label}</span>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm -z-10 animate-fade-in"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            {/* Dropdown Modals (Desktop & Mobile) */}
            {finalDropdownConfigs.map((config) => {
                const isOpen = openDropdown === config.key;
                if (!isOpen) return null;

                const items = dropdownData[config.key] || [];

                return (
                    <div
                        key={config.key}
                        className="fixed inset-0 z-[100] flex items-end md:items-start md:pt-20 justify-center"
                        onClick={() => setOpenDropdown(null)}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"></div>

                        {/* Modal Content */}
                        <div
                            ref={(el) => { dropdownRefs.current[config.key] = el; }}
                            className={`
                relative w-full md:w-[600px] lg:w-[800px] bg-[#1a1a1a] md:rounded-2xl rounded-t-2xl 
                border border-white/10 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col
                animate-slide-up md:animate-scale-in
              `}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5 backdrop-blur-md">
                                <h2 className="text-xl font-bold text-white tracking-wide">{config.title}</h2>
                                <button
                                    onClick={() => setOpenDropdown(null)}
                                    className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Grid content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {items.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {items.map((item, idx) => (
                                            <DropdownItem
                                                key={idx}
                                                config={config}
                                                item={item}
                                                onClick={() => handleDropdownItemClick(config, item)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center text-white/40">
                                        <p>No items found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </header>
    );
}

// Sub-component for dropdown items to keep main explicit
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DropdownItem({ config, item, onClick }: { config: DropdownConfig; item: any; onClick: () => void }) {
    const titleField = config.titleField || "Title";
    const thumbnailField = config.thumbnailField || "Thumbnail";
    const title = item[titleField] || item.BrandName || item.title || "Item";
    const thumbnail = item[thumbnailField];

    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                {thumbnail ? (
                    <img
                        src={`${IMAGE_URL}/uploads/${thumbnail}`}
                        alt={title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <span className="text-xs text-white/20">No Image</span>
                )}
            </div>
            <p className="font-medium text-sm text-center text-white/90 group-hover:text-white line-clamp-2">
                {title}
            </p>
        </button>
    );
}
