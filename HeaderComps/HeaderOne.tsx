"use client";
import { useState, useEffect, useRef } from "react";
import { IonButtons, IonButton } from "@ionic/react";
import { Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { HeaderProps } from "../_SwitcherComps/HeaderSwitcher";

export default function HeaderOne({
  headingField,
  showRightButtons = true,
  menuItems,
  dropdownStyle = "default",
  finalDropdowns,
  dropdownData,
  dropdownLoading,
  fetchDropdownItems,
  contactData,
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
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 shadow-md bg-gradient-to-r from-[#004D25] to-[#00381b] text-white`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">        {/* Logo */}
            <IonButtons>
              <IonButton onClick={() => navigate("/")}>
                <div className="flex items-center gap-2">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-200 shadow-sm">
                    {contactData?.Thumbnail ? (
                      <img
                        src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                        className="w-full h-full object-contain"
                        alt="Logo"
                      />
                    ) : (
                      <div className="w-full h-full animate-pulse bg-gray-300" />
                    )}
                  </div>

                  {headingField && (
                    <h1 className="text-base sm:text-lg font-bold text-[var(--accent-500)]">
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
                  const cfg = finalDropdowns.find(
                    (d) => d.key === m.key
                  );

                  const baseButton =
                    "px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/10 active:bg-white/20 flex items-center gap-2";

                  if (m.hasSubmenu && cfg) {
                    const opened = openDropdown === cfg.key;
                    const loading = dropdownLoading[cfg.key];

                    return (
                      <button
                        key={m.label}
                        onClick={() => handleDropdownClick(cfg)}
                        className={`${baseButton} ${opened ? "bg-[var(--bg-200)] text-[var(--text-primary)] shadow-sm" : "text-white/90 hover:text-white"
                          }`}
                      >
                        <m.icon size={16} />
                        {m.label}
                        {loading ? (
                          <Loader2 size={13} className="animate-spin" />
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
                      className={`${baseButton} ${active ? "bg-white/20 text-white shadow-sm" : "text-white/90 hover:text-white"
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
                className="md:hidden p-2 text-white/90 hover:text-white rounded-lg hover:bg-white/10 active:bg-white/20 transition-all"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden animate-in fade-in slide-in-from-top-2">
              {menuItems.map((m) => {
                const active = currentPath === m.url;
                const cfg = finalDropdowns.find(
                  (d) => d.key === m.key
                );

                const opened = openDropdown === cfg?.key;

                if (m.hasSubmenu && cfg) {
                  return (
                    <div key={m.label} className="mb-1">
                      <button
                        onClick={() => handleDropdownClick(cfg)}
                        className="w-full px-4 py-3 flex justify-between items-center rounded-lg bg-[var(--bg-200)] hover:bg-[var(--bg-300)] transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <m.icon size={17} className="text-[var(--text-muted)]" />
                          <span className="font-medium text-[var(--text-primary)]">{m.label}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${opened ? "rotate-180" : ""
                            }`}
                        />
                      </button>

                      {opened && (
                        <div className={`p-2 bg-[var(--bg-200)]/50 ${dropdownStyle === 'simple' ? 'space-y-1' : 'grid grid-cols-2 gap-3'}`}>
                          {dropdownData[cfg.key]?.map((item: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => {
                                navigate(
                                  cfg.urlPattern.replace("{id}", item[cfg.idField])
                                );
                                setIsMenuOpen(false);
                              }}
                              className={`${dropdownStyle === 'simple'
                                ? "w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-500)] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[var(--bg-300)] shadow-sm hover:shadow"
                                : "bg-white rounded-lg shadow-sm p-2 flex flex-col items-center hover:bg-[var(--bg-200)] active:opacity-80"
                                }`}
                            >
                              {dropdownStyle !== 'simple' && (
                                <img
                                  alt={item[cfg.titleField] || "Item"}
                                  src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                  className="w-14 h-14 rounded-md object-cover mb-2"
                                />
                              )}
                              <p className={`line-clamp-2 ${dropdownStyle === 'simple' ? '' : 'text-xs text-center'}`}>
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
                    className={`w-full px-4 py-3 flex items-center gap-2 rounded-lg mb-1 ${active ? "bg-[var(--bg-300)]" : "bg-[var(--bg-200)] hover:bg-[var(--bg-300)]"
                      }`}
                  >
                    <m.icon size={17} className="text-[var(--text-muted)]" />
                    <span className="font-medium text-[var(--text-primary)]">{m.label}</span>
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
            className="hidden md:block fixed inset-0 bg-black/10 backdrop-blur-sm z-30"
            onClick={() => setOpenDropdown(null)}
          />

          <div className="hidden md:block fixed left-0 right-0 top-16 z-40">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 p-6 transition-all">
                {dropdownLoading[openDropdown] && (!dropdownData[openDropdown] || dropdownData[openDropdown].length === 0) ? (
                  <div className="flex justify-center py-10">
                    <Loader2 size={28} className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className={`${dropdownStyle === 'simple' ? 'columns-2 md:columns-3 lg:columns-4 gap-6 space-y-2' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'}`}>
                    {dropdownData[openDropdown]?.map((item: any, i: number) => {
                      const cfg = finalDropdowns.find((d) => d.key === openDropdown);

                      if (!cfg) return null;

                      if (dropdownStyle === 'simple') {
                        return (
                          <button
                            key={i}
                            onClick={() =>
                              navigate(
                                cfg.urlPattern.replace("{id}", item[cfg.idField])
                              )
                            }
                            className="w-full text-left py-2 px-3 rounded-lg hover:bg-[var(--bg-200)] text-[var(--text-primary)] hover:text-[var(--accent-500)] transition-colors flex items-center gap-2 group break-inside-avoid"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] group-hover:bg-[var(--accent-500)] transition-colors" />
                            <span className="font-medium text-sm truncate">{item[cfg.titleField]}</span>
                          </button>
                        )
                      }

                      return (
                        <button
                          key={i}
                          onClick={() =>
                            navigate(
                              cfg.urlPattern.replace("{id}", item[cfg.idField])
                            )
                          }
                          className="bg-white rounded-xl shadow-sm p-3 hover:shadow-md transition-all border border-[var(--bg-300)]"
                        >
                          <img
                            src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                            className="w-full h-28 rounded-lg object-cover"
                            alt={item[cfg.titleField] || "Item"}
                          />
                          <p className="mt-3 text-sm font-medium text-[var(--text-primary)] line-clamp-2">
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

