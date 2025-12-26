"use client";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Loader2 } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { HeaderProps } from "../_SwitcherComps/HeaderSwitcher";

export default function HeaderThree({
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
    const s = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);

  /** =========================
   *   NAVIGATION
   * ========================== */
  const navigate = (url: string) => {
    window.location.href = url;
  };

  /** =========================
   *   UI START
   * ========================== */
  const currentPath = window.location.pathname;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 
        ${scrolled
            ? "bg-[var(--theme-secondary-bg)]/95 backdrop-blur-xl border-b border-[var(--scolor)]/30"
            : "bg-[var(--theme-secondary-bg)]/90 backdrop-blur-2xl"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">

            {/* LEFT - LOGO */}
            <button onClick={() => navigate("/")} className="flex items-center gap-2">
              <div className="relative w-9 h-9 rounded-2xl bg-[var(--scolor)] overflow-hidden shadow-lg shadow-[var(--scolor)]/20">
                {contactData?.Thumbnail ? (
                  <img
                    src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                    className="w-full h-full object-cover"
                    alt="Logo"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--scolor-contrast)] animate-pulse" />
                )}
              </div>

              {headingField && (
                <h1 className="text-base font-semibold text-[var(--theme-text-primary)]">
                  {headingField}
                </h1>
              )}
            </button>

            {/* DESKTOP NAV */}
            {showRightButtons && (
              <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((m) => {
                  const active = currentPath === m.url;
                  const cfg = finalDropdowns.find((d) => d.key === m.key);
                  const opened = openDropdown === cfg?.key;

                  const baseBtn =
                    "px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2 " +
                    "hover:bg-[var(--scolor)]/20 active:bg-[var(--scolor)]/30";

                  if (m.hasSubmenu && cfg) {
                    return (
                      <button
                        key={m.label}
                        onClick={() => {
                          setOpenDropdown(cfg.key === openDropdown ? null : cfg.key);
                          fetchDropdownItems(cfg.key, cfg.apiEndpoint);
                        }}
                        className={`${baseBtn} ${opened ? "bg-[var(--scolor)] text-[var(--theme-text-primary)]" : "text-[var(--theme-text-muted)]"
                          }`}
                      >
                        <m.icon size={16} />
                        {m.label}
                        {dropdownLoading[cfg.key] ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${opened ? "rotate-180" : ""}`}
                          />
                        )}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={m.label}
                      onClick={() => navigate(m.url)}
                      className={`${baseBtn} ${active ? "bg-[var(--scolor)] text-white" : "text-gray-300"
                        }`}
                    >
                      <m.icon size={16} />
                      {m.label}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* RIGHT - MOBILE MENU ONLY */}
            <div className="flex items-center">
              {/* Mobile Hamburger */}
              <button
                className="md:hidden h-9 w-9 flex items-center justify-center rounded-full bg-[var(--scolor)] hover:bg-[var(--scolor-contrast)] active:scale-95 transition text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {isMenuOpen && (
            <div className="md:hidden mt-2 bg-[var(--theme-secondary-bg)]/95 backdrop-blur-xl rounded-2xl border border-[var(--scolor)]/30 shadow-lg p-3 animate-in fade-in-20">
              {menuItems.map((m) => {
                const active = currentPath === m.url;
                const cfg = finalDropdowns.find((d) => d.key === m.key);
                const opened = openDropdown === cfg?.key;

                if (m.hasSubmenu && cfg) {
                  return (
                    <div key={m.label} className="mb-2">
                      <button
                        onClick={() => {
                          setOpenDropdown(opened ? null : cfg.key);
                          fetchDropdownItems(cfg.key, cfg.apiEndpoint);
                        }}
                        className="w-full flex justify-between items-center px-4 py-3 rounded-xl bg-[var(--scolor)]/20 hover:bg-[var(--scolor)]/30 transition text-white"
                      >
                        <div className="flex items-center gap-2">
                          <m.icon size={17} className="text-white" />
                          <span className="font-medium text-white">{m.label}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${opened ? "rotate-180" : ""}`}
                        />
                      </button>

                      {opened && (
                        <div className="grid grid-cols-2 gap-3 p-3">
                          {dropdownData[cfg.key]?.map((item: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => {
                                navigate(cfg.urlPattern.replace("{id}", item[cfg.idField]));
                                setIsMenuOpen(false);
                              }}
                              className="bg-black border border-[var(--scolor)]/30 rounded-xl shadow-sm p-2 hover:shadow-md hover:border-[var(--scolor)] transition"
                            >
                              <img
                                src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                className="w-14 h-14 rounded-lg object-cover"
                                alt={item[cfg.titleField] || "Item"}
                              />
                              <p className="text-xs text-center mt-2 line-clamp-2 text-white font-semibold">
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
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl mb-1 ${active ? "bg-[var(--scolor)] text-white" : "bg-[var(--scolor)]/20 hover:bg-[var(--scolor)]/30 text-gray-300"
                      }`}
                  >
                    <m.icon size={17} className={active ? "text-white" : "text-gray-300"} />
                    <span className="font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* DESKTOP MEGA DROPDOWN */}
      {openDropdown && (
        <>
          <div
            className="hidden md:block fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setOpenDropdown(null)}
          />

          <div className="hidden md:block fixed left-0 right-0 top-16 z-40">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-[var(--theme-secondary-bg)]/95 backdrop-blur-xl rounded-3xl shadow-xl border border-[var(--scolor)]/30 p-6">
                {dropdownLoading[openDropdown] ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-[var(--scolor)]" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dropdownData[openDropdown]?.map((item, idx) => {
                      const cfg = finalDropdowns.find(
                        (d) => d.key === openDropdown
                      );
                      if (!cfg) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() =>
                            navigate(
                              cfg.urlPattern.replace("{id}", item[cfg.idField])
                            )
                          }
                          className="bg-black border border-[var(--scolor)]/30 rounded-2xl shadow-sm p-3 hover:shadow-lg hover:border-[var(--scolor)] transition"
                        >
                          <img
                            src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                            className="w-full h-28 rounded-xl object-cover"
                            alt={item[cfg.titleField]}
                          />
                          <p className="mt-3 text-sm font-medium line-clamp-2 text-gray-300">
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