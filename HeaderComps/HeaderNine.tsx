"use client";
import { useState, useEffect } from "react";
import { IonButtons, IonButton } from "@ionic/react";
import { Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { HeaderProps } from "../_SwitcherComps/HeaderSwitcher";

export default function HeaderNine({
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
    const [logoLoaded, setLogoLoaded] = useState(false);

    /** =========================
     *   SCROLL EFFECT
     * ========================== */
    useEffect(() => {
        const s = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", s);
        return () => window.removeEventListener("scroll", s);
    }, []);

    /** =========================
     *   KEYBOARD NAVIGATION
     * ========================== */
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

    /** =========================
     *   NAVIGATION
     * ========================== */
    const navigate = (url: string) => {
        window.location.href = url;
    };

    const handleDropdownClick = (cfg: any) => {
        if (openDropdown === cfg.key) {
            setOpenDropdown(null);
            return;
        }
        setOpenDropdown(cfg.key);
        fetchDropdownItems(cfg.key, cfg.apiEndpoint);
    };

    /** =========================
     *   CURRENT PATH
     * ========================== */
    const currentPath = window.location.pathname;

    /** =========================
     *   UI START
     * ========================== */
    return (
        <>
            <header
                id="page-header-primary"
                className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
                    ? "bg-[var(--theme-text-primary)]/70 backdrop-blur-xl shadow-md shadow-[var(--scolor)]/5"
                    : "bg-[var(--theme-text-primary)]/50 backdrop-blur-lg"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <IonButtons>
                            <IonButton onClick={() => navigate("/")}>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[var(--scolor)]/10 shadow-sm ring-2 ring-[var(--scolor)]/20">
                                        {contactData?.Thumbnail ? (
                                            <img
                                                src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                                                onLoad={() => setLogoLoaded(true)}
                                                className="w-full h-full object-contain"
                                                alt="Logo"
                                            />
                                        ) : (
                                            <div className="w-full h-full animate-pulse bg-[#1C77A4]/20" />
                                        )}
                                    </div>

                                    {headingField && (
                                        <h1 className="text-base sm:text-lg font-bold text-gray-900">
                                            {headingField}
                                        </h1>
                                    )}
                                </div>
                            </IonButton>
                        </IonButtons>

                        {/* Desktop Nav */}
                        {showRightButtons && (
                            <nav className="hidden md:flex items-center gap-1">
                                {menuItems.map((m) => {
                                    const active = currentPath === m.url;
                                    const cfg = finalDropdowns.find((d) => d.key === m.key);

                                    const baseButton =
                                        "px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 font-medium";

                                    if (m.hasSubmenu && cfg) {
                                        const opened = openDropdown === cfg.key;
                                        const loading = dropdownLoading[cfg.key];

                                        return (
                                            <button
                                                key={m.label}
                                                onClick={() => handleDropdownClick(cfg)}
                                                className={`${baseButton} ${opened
                                                    ? "bg-[var(--scolor)]/10 text-[var(--scolor)]"
                                                    : "text-[var(--theme-text-muted)] hover:bg-[var(--scolor)]/5 hover:text-[var(--scolor)]"
                                                    }`}
                                            >
                                                <m.icon size={16} />
                                                {m.label}
                                                {loading && (!dropdownData[cfg.key] || dropdownData[cfg.key].length === 0) ? (
                                                    <Loader2 size={13} className="animate-spin text-[#1C77A4]" />
                                                ) : (
                                                    <ChevronDown
                                                        size={14}
                                                        className={`transition-transform ${opened ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                )}
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            key={m.label}
                                            onClick={() => navigate(m.url)}
                                            className={`${baseButton} ${active
                                                ? "bg-[var(--scolor)] text-[var(--theme-primary-text)] shadow-md shadow-[var(--scolor)]/30"
                                                : "text-[var(--theme-text-muted)] hover:bg-[var(--scolor)]/5 hover:text-[var(--scolor)]"
                                                }`}
                                        >
                                            <m.icon size={16} />
                                            {m.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        )}

                        {/* Mobile Menu Button */}
                        {showRightButtons && (
                            <button
                                className="md:hidden p-2 text-[#1C77A4] rounded-lg hover:bg-[#1C77A4]/10 active:bg-[#1C77A4]/20 transition-all font-medium"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden animate-in fade-in slide-in-from-top-2 pb-4">
                            {menuItems.map((m) => {
                                const active = currentPath === m.url;
                                const cfg = finalDropdowns.find((d) => d.key === m.key);
                                const opened = openDropdown === cfg?.key;

                                if (m.hasSubmenu && cfg) {
                                    return (
                                        <div key={m.label} className="mb-1">
                                            <button
                                                onClick={() => handleDropdownClick(cfg)}
                                                className={`w-full px-4 py-3 flex justify-between items-center rounded-lg transition-all ${opened
                                                    ? "bg-[#1C77A4]/10 border border-[#1C77A4]/20"
                                                    : "bg-gray-50 hover:bg-[#1C77A4]/5"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <m.icon size={17} className={opened ? "text-[#1C77A4]" : "text-gray-700"} />
                                                    <span className={`font-medium ${opened ? "text-[#1C77A4]" : "text-gray-900"}`}>
                                                        {m.label}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform ${opened ? "rotate-180 text-[#1C77A4]" : "text-gray-500"}`}
                                                />
                                            </button>

                                            {opened && (
                                                <div className="grid grid-cols-2 gap-3 p-3 bg-[#1C77A4]/5 rounded-lg mt-1">
                                                    {dropdownData[cfg.key]?.map((item: any, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                navigate(
                                                                    cfg.urlPattern.replace("{id}", item[cfg.idField])
                                                                );
                                                                setIsMenuOpen(false);
                                                            }}
                                                            className="bg-[var(--theme-text-primary)] rounded-lg shadow-sm p-2 flex flex-col items-center hover:bg-[var(--scolor)]/5 active:bg-[var(--scolor)]/10 border border-transparent hover:border-[var(--scolor)]/20 transition-all text-left"
                                                        >
                                                            <div className="w-14 h-14 overflow-hidden rounded-md">
                                                                <img
                                                                    alt={item[cfg.titleField] || "Item"}
                                                                    src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                                                    className="w-full h-full object-cover ring-1 ring-[#1C77A4]/10"
                                                                />
                                                            </div>
                                                            <p className="mt-2 text-xs text-gray-700 text-center line-clamp-2 font-medium">
                                                                {item[cfg.titleField]}
                                                            </p>
                                                        </button>
                                                    ))}
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
                                        className={`w-full px-4 py-3 flex items-center gap-2 rounded-lg mb-1 transition-all font-medium ${active
                                            ? "bg-[var(--scolor)] text-[var(--theme-primary-text)] shadow-md shadow-[var(--scolor)]/30"
                                            : "bg-[var(--theme-text-secondary)]/10 hover:bg-[var(--scolor)]/5 hover:text-[var(--scolor)]"
                                            }`}
                                    >
                                        <m.icon size={17} className={active ? "text-white" : "text-gray-700"} />
                                        <span className="font-medium">{m.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </header>

            {/* Mega Dropdown (Desktop) */}
            {openDropdown && (
                <>
                    <div
                        className="hidden md:block fixed inset-0 bg-[#1C77A4]/5 backdrop-blur-sm z-30"
                        onClick={() => setOpenDropdown(null)}
                    />

                    <div className="hidden md:block fixed left-0 right-0 top-16 sm:top-20 z-40">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="bg-white/95 backdrop-blur-xl rounded-b-2xl shadow-xl shadow-[#1C77A4]/10 border border-[#1C77A4]/10 p-6 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
                                {dropdownLoading[openDropdown] && (!dropdownData[openDropdown] || dropdownData[openDropdown].length === 0) ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 size={28} className="animate-spin text-[#1C77A4]" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {dropdownData[openDropdown]?.map((item: any, i: number) => {
                                            const cfg = finalDropdowns.find((d) => d.key === openDropdown);
                                            if (!cfg) return null;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        navigate(
                                                            cfg.urlPattern.replace("{id}", item[cfg.idField])
                                                        )
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="bg-[var(--theme-text-primary)] rounded-xl shadow-sm p-3 hover:shadow-lg hover:shadow-[var(--scolor)]/10 transition-all border border-transparent hover:border-[var(--scolor)]/20 group text-left"
                                                >
                                                    <div className="overflow-hidden rounded-lg">
                                                        <img
                                                            src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                                            className="w-full h-28 object-cover ring-1 ring-[#1C77A4]/10 group-hover:ring-[#1C77A4]/30 group-hover:scale-105 transition-all duration-300"
                                                            alt={item[cfg.titleField] || "Item"}
                                                        />
                                                    </div>
                                                    <p className="mt-3 text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[#1C77A4] transition-colors leading-tight">
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
    );
}

