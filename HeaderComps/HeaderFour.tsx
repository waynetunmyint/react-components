"use client";
import { useState, useEffect } from "react";
import { IonButtons, IonButton } from "@ionic/react";
import { Menu, X, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { HeaderProps } from "../_SwitcherComps/HeaderSwitcher";

/**
 * HeaderFour - Floating Glassmorphic Design
 * Modern floating header with glassmorphism, gradient accents, and smooth animations
 */
export default function HeaderFour({
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

  const currentPath = window.location.pathname;

  return (
    <>
      {/* Floating Container with max-width padding from edges */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <header
          className={`max-w-7xl mx-auto rounded-2xl transition-all duration-500 ${scrolled
            ? "bg-white/70 backdrop-blur-2xl shadow-2xl shadow-orange-500/10 border border-orange-100/50"
            : "bg-white/40 backdrop-blur-xl border border-white/30"
            }`}
        >
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              {/* LEFT - Logo with Gradient Ring */}
              <IonButtons>
                <IonButton onClick={() => navigate("/")}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* Gradient Ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 opacity-75 blur-sm" />

                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white shadow-xl ring-2 ring-orange-200 p-1.5">
                        {contactData?.Thumbnail ? (
                          <img
                            src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                            className="w-full h-full object-contain rounded-full"
                            alt="Logo"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-400 animate-pulse rounded-full" />
                        )}
                      </div>
                    </div>

                    {headingField && (
                      <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                        {headingField}
                      </h1>
                    )}
                  </div>
                </IonButton>
              </IonButtons>

              {/* CENTER - Desktop Nav Pills */}
              {showRightButtons && (
                <nav className="hidden md:flex items-center gap-2 bg-gray-50/50 backdrop-blur-sm rounded-full px-3 py-2">
                  {menuItems.map((m) => {
                    const active = currentPath === m.url;
                    const cfg = finalDropdowns.find((d) => d.key === m.key);

                    if (m.hasSubmenu && cfg) {
                      const opened = openDropdown === cfg.key;

                      return (
                        <button
                          key={m.label}
                          onClick={() => handleDropdownClick(cfg)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${opened
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
                            : "text-gray-700 hover:bg-white/80 hover:shadow-md"
                            }`}
                        >
                          <m.icon size={16} />
                          {m.label}
                          {dropdownLoading[cfg.key] ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-300 ${opened ? "rotate-180" : ""
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
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${active
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30"
                          : "text-gray-700 hover:bg-white/80 hover:shadow-md"
                          }`}
                      >
                        <m.icon size={16} />
                        {m.label}
                      </button>
                    );
                  })}
                </nav>
              )}

              {/* RIGHT - Mobile Menu */}
              {showRightButtons && (
                <button
                  className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              )}
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
              <div className="md:hidden pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-3 space-y-2 border border-orange-100/50">
                  {menuItems.map((m) => {
                    const active = currentPath === m.url;
                    const cfg = finalDropdowns.find((d) => d.key === m.key);
                    const opened = openDropdown === cfg?.key;

                    if (m.hasSubmenu && cfg) {
                      return (
                        <div key={m.label}>
                          <button
                            onClick={() => handleDropdownClick(cfg)}
                            className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all ${opened
                              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                              : "bg-white/50 hover:bg-white/80"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <m.icon size={18} />
                              <span className="font-medium">{m.label}</span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-300 ${opened ? "rotate-180" : ""
                                }`}
                            />
                          </button>

                          {opened && (
                            <div className="grid grid-cols-2 gap-2 p-2 mt-2">
                              {dropdownData[cfg.key]?.map((item: any, i: number) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    navigate(
                                      cfg.urlPattern.replace("{id}", String(item[cfg.idField] || ""))
                                    )
                                    setIsMenuOpen(false);
                                  }}
                                  className="bg-white rounded-xl shadow-sm p-2 hover:shadow-lg transition-all group text-left"
                                >
                                  <img
                                    src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                    className="w-full h-16 rounded-lg object-cover group-hover:scale-105 transition-transform"
                                    alt={String(item[cfg.titleField] || "Item")}
                                  />
                                  <p className="text-xs text-gray-900 mt-2 line-clamp-2 font-semibold">
                                    {String(item[cfg.titleField] || "")}
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
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                          : "bg-white/50 hover:bg-white/80"
                          }`}
                      >
                        <m.icon size={18} />
                        <span className="font-medium">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* Spacer to prevent content overlap */}
      <div className="h-20" />

      {/* Desktop Mega Dropdown */}
      {openDropdown && (
        <>
          <div
            className="hidden md:block fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setOpenDropdown(null)}
          />

          <div className="hidden md:block fixed left-0 right-0 top-24 z-40 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-orange-100/50 p-8 animate-in fade-in slide-in-from-top-4 duration-300">
                {dropdownLoading[openDropdown] && (!dropdownData[openDropdown] || dropdownData[openDropdown].length === 0) ? (
                  <div className="flex justify-center py-16">
                    <div className="relative">
                      <Sparkles className="absolute inset-0 text-orange-400 animate-pulse" size={32} />
                      <Loader2 size={32} className="animate-spin text-orange-500" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {dropdownData[openDropdown]?.map((item: any, i: number) => {
                      const cfg = finalDropdowns.find((d) => d.key === openDropdown);
                      if (!cfg) return null;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            navigate(cfg.urlPattern.replace("{id}", String(item[cfg.idField] || "")))
                            setOpenDropdown(null);
                          }}
                          className="group bg-white rounded-2xl p-4 shadow-md hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 text-left"
                        >
                          <div className="relative overflow-hidden rounded-xl mb-3">
                            <img
                              src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                              className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                              alt={String(item[cfg.titleField] || "Item")}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {String(item[cfg.titleField] || "")}
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

