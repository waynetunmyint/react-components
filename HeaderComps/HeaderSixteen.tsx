"use client";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Loader2, Clock, Mail, Headphones } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { HeaderProps } from "../_SwitcherComps/HeaderSwitcher";

export default function HeaderSixteen({
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

    const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

    return (
        <div className="relative font-sans bg-white w-full">
            {/* 
        ==============================
           TOP SECTION (White)
        ==============================
      */}
            <div className="bg-white relative z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                        {/* Logo Area */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                            <div className="h-16 w-16 md:h-20 md:w-20 relative flex-shrink-0">
                                {contactData?.Thumbnail ? (
                                    <img
                                        src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                                        className="h-full w-full object-contain"
                                        alt="Logo"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xs p-2 text-center">
                                        {headingField?.substring(0, 1) || "E"}
                                    </div>
                                )}
                            </div>

                            <div className="w-[200px]">
                                <h1 className=" md:text-xl font-extrabold text-gray-800 leading-tight uppercase tracking-tight">
                                    <span className="text-gray-800">
                                        {contactData?.HeaderSubtitle || "EDUCARE INTERNATIONAL SERVICES"}
                                    </span>
                                    {/* <div className=""> {contactData?.HeaderTitle || headingField || "EDUCARE"}</div> */}
                                </h1>
                            </div>
                        </div>

                        {/* Info Section (Desktop) */}
                        <div className="hidden md:flex items-center gap-8 lg:gap-12">

                            {/* Office Hour */}
                            <div className="flex items-center gap-3">
                                <Clock size={34} className="text-gray-900" strokeWidth={1.2} />
                                <div>
                                    <h6 className="text-[14px] font-bold text-[#fccb06] tracking-wide uppercase leading-tight">
                                        Office Hour
                                    </h6>
                                    <p className="text-[14px] text-gray-800 font-medium whitespace-nowrap">
                                        {contactData?.OpenTime || "Mon-Fri 09:00 - 17:00 | Sat 9:00 - 12:00"}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <Mail size={34} className="text-gray-900" strokeWidth={1.2} />
                                <div>
                                    <h6 className="text-[14px] font-bold text-[#fccb06] tracking-wide uppercase leading-tight">
                                        Email Us
                                    </h6>
                                    <p className="text-[14px] text-gray-800 font-medium whitespace-nowrap">
                                        {contactData?.Email || "grace@educareservice.com"}
                                    </p>
                                </div>
                            </div>

                            {/* Call Us */}
                            <div className="flex items-center gap-3">
                                <Headphones size={34} className="text-gray-900" strokeWidth={1.2} />
                                <div>
                                    <h6 className="text-[14px] font-bold text-[#fccb06] tracking-wide uppercase leading-tight">
                                        Call Us
                                    </h6>
                                    <p className="text-[14px] text-gray-800 font-medium whitespace-nowrap">
                                        {contactData?.PhoneOne || "+959762850296"}
                                    </p>
                                </div>
                            </div>

                        </div>

                        {/* Mobile Menu Toggle (visible on mobile only) */}
                        <button
                            className="md:hidden absolute top-4 right-4 p-2 text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* 
        ==============================
           BOTTOM NAVIGATION (Dark)
        ==============================
      */}
            <div className={`bg-[#454545] text-white relative z-40 transition-all duration-300 ${scrolled ? 'fixed top-0 left-0 right-0 shadow-lg' : ''}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-center md:justify-center">

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center">
                            {menuItems.map((m, index) => {
                                const active = currentPath === m.url;
                                const cfg = finalDropdowns.find((d) => d.key === m.key);
                                const highlightClass = active ? "text-[#fccb06]" : "text-white hover:text-[#fccb06]";

                                return (
                                    <div key={m.label} className="flex items-center">
                                        {index > 0 && <span className="text-white mx-2 font-bold opacity-80">-</span>}
                                        {m.hasSubmenu && cfg ? (
                                            <div className="relative group">
                                                <button
                                                    onClick={() => handleDropdownClick(cfg)}
                                                    className={`flex items-center gap-2 px-4 py-4 text-[13px] font-bold tracking-widest uppercase transition-colors ${openDropdown === cfg.key ? "text-[#fccb06]" : highlightClass
                                                        }`}
                                                >
                                                    {m.label}
                                                    {dropdownLoading[cfg.key] && (!dropdownData[cfg.key] || dropdownData[cfg.key].length === 0) ? (
                                                        <Loader2 size={12} className="animate-spin text-[#fccb06]" />
                                                    ) : (
                                                        <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === cfg.key ? "rotate-180" : ""}`} />
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => navigate(m.url)}
                                                className={`flex items-center gap-2 px-4 py-4 text-[13px] font-bold tracking-widest uppercase transition-colors ${highlightClass}`}
                                            >
                                                {m.label}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            {/* 
         ==============================
           MOBILE MENU DROPDOWN
         ==============================
       */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[60] bg-white animate-in slide-in-from-right duration-300">
                    <div className="flex justify-between items-center p-4 border-b">
                        <div className="flex items-center gap-2">
                            {contactData?.Thumbnail && (
                                <img src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`} className="h-10 w-auto" alt="Logo" />
                            )}
                            <span className="font-bold text-gray-800">MENU</span>
                        </div>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-800">
                            <X size={28} />
                        </button>
                    </div>

                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {menuItems.map((m) => {
                            const cfg = finalDropdowns.find(d => d.key === m.key);
                            const opened = openDropdown === cfg?.key;

                            if (m.hasSubmenu && cfg) {
                                return (
                                    <div key={m.label} className="border-b border-gray-100 pb-2">
                                        <button
                                            onClick={() => handleDropdownClick(cfg)}
                                            className="w-full flex justify-between items-center py-2 text-left font-bold text-gray-800 uppercase tracking-wider"
                                        >
                                            {m.label}
                                            <ChevronDown size={18} className={`transition-transform ${opened ? 'rotate-180' : ''}`} />
                                        </button>
                                        {opened && (
                                            <div className="pl-4 mt-2 space-y-3 bg-gray-50 p-3 rounded-lg">
                                                {dropdownLoading[cfg.key] && (!dropdownData[cfg.key] || dropdownData[cfg.key].length === 0) ? (
                                                    <Loader2 className="animate-spin mx-auto text-gray-400" size={20} />
                                                ) : (
                                                    dropdownData[cfg.key]?.map((item: any, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                navigate(cfg.urlPattern.replace("{id}", item[cfg.idField]));
                                                                setIsMenuOpen(false);
                                                            }}
                                                            className="w-full text-left text-sm font-medium text-gray-600 hover:text-[#fccb06]"
                                                        >
                                                            {item[cfg.titleField]}
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
                                    onClick={() => { navigate(m.url); setIsMenuOpen(false); }}
                                    className="w-full text-left py-2 font-bold text-gray-800 uppercase tracking-wider border-b border-gray-100"
                                >
                                    {m.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 px-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-[#fccb06]" />
                            <span className="text-sm text-gray-600">{contactData?.WorkTime || "Mon-Fri 09:00 - 17:00 | Sat 9:00 - 12:00"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail size={20} className="text-[#fccb06]" />
                            <span className="text-sm text-gray-600 font-medium">{contactData?.Email || "grace@educareservice.com"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Headphones size={20} className="text-[#fccb06]" />
                            <span className="text-sm text-gray-600 font-medium">{contactData?.Phone || "+959762850296"}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 
        ==============================
           MEGA DROPDOWN (DESKTOP)
        ==============================
      */}
            {openDropdown && !isMenuOpen && (
                <>
                    <div
                        className="hidden md:block fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
                        onClick={() => setOpenDropdown(null)}
                    />
                    <div className={`hidden md:block fixed left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'top-[52px]' : 'top-[160px]'}`}>
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="bg-white shadow-2xl rounded-b-2xl border-t-4 border-[#fccb06] p-8 max-h-[75vh] overflow-y-auto">
                                {dropdownLoading[openDropdown] && (!dropdownData[openDropdown] || dropdownData[openDropdown].length === 0) ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 size={40} className="animate-spin text-[#fccb06]" />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                        {dropdownData[openDropdown]?.map((item: any, i: number) => {
                                            const cfg = finalDropdowns.find((d) => d.key === openDropdown);
                                            if (!cfg) return null;
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => {
                                                        navigate(cfg.urlPattern.replace("{id}", item[cfg.idField]));
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="group cursor-pointer"
                                                >
                                                    <div className="relative overflow-hidden aspect-video rounded-lg mb-3 shadow-md">
                                                        <img
                                                            src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            alt={item[cfg.titleField]}
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold uppercase tracking-widest border border-white px-3 py-1">View Detail</span>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#fccb06] transition-colors uppercase tracking-tight">
                                                        {item[cfg.titleField]}
                                                    </h3>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}

