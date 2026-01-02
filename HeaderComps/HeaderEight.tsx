"use client";
import { useState, useEffect } from "react";
import { IonButtons, IonButton } from "@ionic/react";
import { Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { IMAGE_URL } from "@/config";
import { HeaderProps } from "../_SwitcherComps/HeaderSwitcher";

export default function HeaderEight({
    headingField,
    showRightButtons = true,
    menuItems,
    finalDropdowns,
    dropdownData,
    dropdownLoading,
    fetchDropdownItems,
    contactData,
    dropdownStyle = "default",
}: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const s = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", s);
        return () => window.removeEventListener("scroll", s);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpenDropdown(null);
                setIsMenuOpen(false);
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    const navigate = (url: string) => (window.location.href = url);

    const handleDropdownClick = (cfg: any) => {
        if (openDropdown === cfg.key) {
            setOpenDropdown(null);
            return;
        }
        setOpenDropdown(cfg.key);
        fetchDropdownItems(cfg.key, cfg.apiEndpoint);
    };

    return (
        <>
            <header
                style={{ background: 'var(--accent-500)' }}
                className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "shadow-2xl" : "shadow-lg"}`}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col">

                        {/* ROW 1: Logo Centered */}
                        <div className="flex items-center justify-center py-3 border-b border-white/10 relative">
                            <IonButtons>
                                <IonButton onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity">
                                    <div className="flex flex-col items-center">
                                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-[var(--theme-text-primary)] shadow-md">
                                            {contactData?.Thumbnail ? (
                                                <img
                                                    src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                                                    className="w-full h-full rounded-full"
                                                    alt="Logo"
                                                />
                                            ) : (
                                                <div className="w-full h-full animate-pulse bg-[var(--theme-text-muted)] opacity-20" />
                                            )}
                                        </div>

                                        {headingField && (
                                            <h1 className="block md:hidden text-sm sm:text-base font-bold text-[var(--theme-primary-text)] drop-shadow-sm tracking-tight text-center mt-1">
                                                {headingField}
                                            </h1>
                                        )}
                                    </div>
                                </IonButton>
                            </IonButtons>

                            {/* Mobile Menu Button */}
                            {showRightButtons && (
                                <button
                                    className="md:hidden p-2 text-white/80 hover:text-white rounded-lg transition-all absolute right-0 top-2"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            )}
                        </div>

                        {/* ROW 2: Desktop Navigation */}
                        {showRightButtons && (
                            <div className="hidden md:flex items-center justify-center h-10">
                                <nav className="flex items-center gap-1">
                                    {menuItems.map((m) => {
                                        const active = window.location.pathname === m.url;
                                        const cfg = finalDropdowns.find((d) => d.key === m.key);

                                        const baseButton =
                                            "px-3 py-1 rounded-full text-xs font-semibold transition-all hover:bg-white/20 hover:text-white active:bg-white/30 flex items-center gap-2 whitespace-nowrap text-white/90";

                                        if (m.hasSubmenu && cfg) {
                                            const opened = openDropdown === cfg.key;
                                            const loading = dropdownLoading[cfg.key];
                                            return (
                                                <button
                                                    key={m.label}
                                                    onClick={() => handleDropdownClick(cfg)}
                                                    className={`${baseButton} ${opened ? "bg-white/20 text-white" : active ? "text-white bg-white/10" : ""
                                                        }`}
                                                >
                                                    <m.icon size={14} />
                                                    {m.label}
                                                    {loading && (!dropdownData[cfg.key] || dropdownData[cfg.key].length === 0) ? (
                                                        <Loader2 size={12} className="animate-spin text-white" />
                                                    ) : (
                                                        <ChevronDown
                                                            size={12}
                                                            className={`transition-transform text-white ${opened ? "rotate-180" : ""}`}
                                                        />
                                                    )}
                                                </button>
                                            );
                                        }

                                        return (
                                            <button
                                                key={m.label}
                                                onClick={() => navigate(m.url)}
                                                className={`${baseButton} ${active ? "bg-white/20 text-white" : ""}`}
                                            >
                                                <m.icon size={14} />
                                                {m.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden animate-in fade-in slide-in-from-top-2 py-2.5 border-t border-white/20 max-h-[85vh] overflow-y-auto">
                            {menuItems.map((m) => {
                                const active = window.location.pathname === m.url;
                                const cfg = finalDropdowns.find((d) => d.key === m.key);
                                const opened = openDropdown === cfg?.key;

                                if (m.hasSubmenu && cfg) {
                                    return (
                                        <div key={m.label} className="mb-2">
                                            <button
                                                onClick={() => handleDropdownClick(cfg)}
                                                className={`w-full px-4 py-2.5 flex justify-between items-center rounded-xl transition-all text-white border border-white/20 shadow-sm ${opened ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <m.icon size={18} className="text-white" />
                                                    <span className="font-semibold text-white">{m.label}</span>
                                                </div>
                                                <ChevronDown
                                                    size={18}
                                                    className={`transition-transform text-white ${opened ? "rotate-180" : ""}`}
                                                />
                                            </button>

                                            {opened && (
                                                <div
                                                    style={{ background: 'var(--accent-500)' }}
                                                    className={`p-3 rounded-b-xl -mt-1 mx-2 ${!cfg.isMegaMenu ? 'space-y-1' : 'grid grid-cols-3 gap-3'}`}>
                                                    {dropdownLoading[cfg.key] && (!dropdownData[cfg.key] || dropdownData[cfg.key].length === 0) ? (
                                                        [...Array(6)].map((_, i) => (
                                                            <div key={i} className="animate-pulse flex flex-col items-center">
                                                                <div className="w-full aspect-square bg-white/20 rounded-md mb-2"></div>
                                                                <div className="h-2 w-full bg-white/20 rounded"></div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        dropdownData[cfg.key]?.map((item: any, i: number) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => {
                                                                    navigate(cfg.urlPattern.replace("{id}", item[cfg.idField]));
                                                                    setIsMenuOpen(false);
                                                                }}
                                                                className={`${!cfg.isMegaMenu
                                                                    ? "w-full text-left px-3 py-2.5 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors border border-white/5"
                                                                    : "bg-white/10 text-center rounded-lg shadow-sm p-2 flex flex-col items-center hover:bg-white/20 transition-colors"
                                                                    }`}
                                                            >
                                                                {cfg.isMegaMenu && (
                                                                    <img
                                                                        alt={item[cfg.titleField] || "Item"}
                                                                        src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                                                        className="w-full rounded-md object-cover ring-1 ring-white/20 mb-2"
                                                                    />
                                                                )}
                                                                <p className="text-white text-xs font-bold text-center line-clamp-2 uppercase tracking-tighter">
                                                                    {item[cfg.titleField]}
                                                                </p>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        key={m.label}
                                        onClick={() => {
                                            navigate(m.url);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`w-full px-4 py-2.5 flex items-center gap-3 rounded-xl mb-2 transition-all border shadow-sm ${active
                                            ? "bg-white/20 text-white border-white/30"
                                            : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                                            }`}
                                    >
                                        <m.icon size={18} className="text-white" />
                                        <span className="font-semibold text-white">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </header>

            {/* Desktop Mega Dropdown */}
            {openDropdown && (
                <>
                    <div
                        className="hidden md:block fixed inset-0 bg-black/20 backdrop-blur-sm z-30 animate-in fade-in"
                        onClick={() => setOpenDropdown(null)}
                    />
                    <div className="hidden md:block fixed left-0 right-0 top-28 z-40 animate-in slide-in-from-top-2">
                        <div className={`${!finalDropdowns.find(d => d.key === openDropdown)?.isMegaMenu ? 'max-w-sm' : 'max-w-7xl'} mx-auto px-4`}>
                            <div
                                className="backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 max-h-[75vh] overflow-y-auto border border-white/20"
                                style={{ background: 'var(--accent-500)' }}
                            >
                                {dropdownLoading[openDropdown] && (!dropdownData[openDropdown] || dropdownData[openDropdown].length === 0) ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                                        {[...Array(8)].map((_, i) => (
                                            <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <div className="aspect-[16/9] bg-gray-200 rounded-lg mb-3"></div>
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`${!finalDropdowns.find(d => d.key === openDropdown)?.isMegaMenu ? 'flex flex-col space-y-1' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5'}`}>
                                        {dropdownData[openDropdown]?.map((item: any, i: number) => {
                                            const cfg = finalDropdowns.find((d) => d.key === openDropdown);
                                            if (!cfg) return null;

                                            if (!cfg?.isMegaMenu) {
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            navigate(cfg.urlPattern.replace("{id}", item[cfg.idField]))
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="w-full text-left py-3 px-4 rounded-xl hover:bg-white/10 text-white transition-all flex items-center gap-3 group border border-transparent hover:border-white/10"
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white transition-colors" />
                                                        <span className="font-bold text-sm uppercase tracking-tight">{item[cfg.titleField]}</span>
                                                    </button>
                                                )
                                            }

                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        navigate(cfg.urlPattern.replace("{id}", item[cfg.idField]))
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="group bg-white/10 rounded-2xl shadow-sm p-4 hover:bg-white/20 hover:scale-[1.02] active:scale-95 transition-all text-left border border-white/10"
                                                >
                                                    <div className="relative overflow-hidden rounded-xl aspect-[16/9] mb-3 bg-white/5 border border-white/10">
                                                        {item[cfg.thumbnailField] ? (
                                                            <img
                                                                src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                alt={item[cfg.titleField] || "Item"}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Image</div>
                                                        )}
                                                    </div>
                                                    <p className="font-black text-white line-clamp-2 leading-tight uppercase tracking-tighter text-sm">
                                                        {item[cfg.titleField]}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

