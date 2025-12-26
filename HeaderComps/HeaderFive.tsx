"use client";
import { useState, useEffect } from "react";
import { IonButtons, IonButton } from "@ionic/react";
import { X, ChevronRight, Loader2, Grid3x3 } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { HeaderProps } from "../_SwitcherComps/HeaderSwitcher";

/**
 * HeaderFive - Minimal Sidebar Toggle Design
 * Ultra-clean minimalist header with slide-in sidebar navigation
 */
export default function HeaderFive({
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);

  const navigate = (url: string) => {
    window.location.href = url;
    setIsSidebarOpen(false);
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
      {/* Minimalist Top Bar */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-[var(--scolor)] border-b border-[var(--scolor-contrast)] shadow-sm"
          : "bg-[var(--scolor)]/95 backdrop-blur-lg"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* LEFT - Logo */}
            <IonButtons>
              <IonButton onClick={() => navigate("/")}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--scolor)] to-[var(--scolor-contrast)] shadow-md flex items-center justify-center">
                    {contactData?.Thumbnail ? (
                      <img
                        src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                        className="w-full h-full object-cover"
                        alt="Logo"
                      />
                    ) : (
                      <span className="text-[var(--theme-primary-text)] text-xs font-bold">LG</span>
                    )}
                  </div>

                  {headingField && (
                    <h1 className="text-base font-bold text-gray-900 tracking-tight">
                      {headingField}
                    </h1>
                  )}
                </div>
              </IonButton>
            </IonButtons>

            {/* CENTER - Desktop Minimal Nav */}
            {showRightButtons && (
              <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((m) => {
                  const active = currentPath === m.url;
                  const cfg = finalDropdowns.find((d) => d.key === m.key);

                  if (m.hasSubmenu && cfg) {
                    const opened = openDropdown === cfg.key;

                    return (
                      <button
                        key={m.label}
                        onClick={() => handleDropdownClick(cfg)}
                        className={`px-3 py-2 text-sm font-medium transition-all flex items-center gap-1.5 border-b-2 ${opened
                          ? "text-[var(--scolor-contrast)] border-[var(--scolor-contrast)]"
                          : "text-[var(--scolor-contrast)]/70 border-transparent hover:text-[var(--scolor-contrast)] hover:border-[var(--scolor-contrast)]/30"
                          }`}
                      >
                        {m.label}
                        {dropdownLoading[cfg.key] ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <ChevronRight
                            size={12}
                            className={`transition-transform ${opened ? "rotate-90" : ""
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
                      className={`px-3 py-2 text-sm font-medium transition-all border-b-2 ${active
                        ? "text-[var(--scolor-contrast)] border-[var(--scolor-contrast)]"
                        : "text-[var(--scolor-contrast)]/70 border-transparent hover:text-[var(--scolor-contrast)] hover:border-[var(--scolor-contrast)]/30"
                        }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* RIGHT - Menu Toggle */}
            {showRightButtons && (
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--theme-text-secondary)] opacity-10 active:opacity-20 transition-colors"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Grid3x3 size={20} className="text-[var(--theme-secondary-bg)]" />
              </button>
            )}
          </div>

          {/* Desktop Dropdown (Inline) */}
          {openDropdown && (
            <div className="hidden md:block py-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
              {dropdownLoading[openDropdown] && (!dropdownData[openDropdown] || dropdownData[openDropdown].length === 0) ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-[var(--scolor-contrast)]" />
                </div>
              ) : (
                <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
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
                        className="group text-left"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                          <img
                            src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={String(item[cfg.titleField] || "Item")}
                          />
                        </div>
                        <p className="text-xs font-medium text-gray-700 line-clamp-2 group-hover:text-[var(--scolor-contrast)] transition-colors">
                          {String(item[cfg.titleField] || "")}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Spacer */}
      <div className="h-14" />

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[var(--theme-primary-text)]/30 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Slide-in Sidebar */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((m) => {
                const active = currentPath === m.url;
                const cfg = finalDropdowns.find((d) => d.key === m.key);
                const opened = openDropdown === cfg?.key;

                if (m.hasSubmenu && cfg) {
                  return (
                    <div key={m.label}>
                      <button
                        onClick={() => handleDropdownClick(cfg)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${opened
                          ? "bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]"
                          : "text-[var(--theme-text-muted)] hover:bg-[var(--theme-text-secondary)]/10"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <m.icon size={20} />
                          <span className="font-medium">{m.label}</span>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`transition-transform ${opened ? "rotate-90" : ""
                            }`}
                        />
                      </button>

                      {opened && (
                        <div className="grid grid-cols-2 gap-2 p-2 mt-2">
                          {dropdownData[cfg.key]?.map((item: any, i: number) => (
                            <button
                              key={i}
                              onClick={() =>
                                navigate(
                                  cfg.urlPattern.replace("{id}", String(item[cfg.idField] || ""))
                                )
                              }
                              className="group text-left"
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                                <img
                                  src={`${IMAGE_URL}/uploads/${item[cfg.thumbnailField]}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  alt={String(item[cfg.titleField] || "Item")}
                                />
                              </div>
                              <p className="text-xs font-semibold text-gray-900 line-clamp-2">
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
                    onClick={() => navigate(m.url)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active
                      ? "bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]"
                      : "text-[var(--theme-text-muted)] hover:bg-[var(--theme-text-secondary)]/10"
                      }`}
                  >
                    <m.icon size={20} />
                    <span className="font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                {contactData?.Thumbnail ? (
                  <img
                    src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                    className="w-full h-full rounded-full object-cover"
                    alt="Logo"
                  />
                ) : (
                  <span className="text-[var(--theme-primary-text)] text-sm font-bold">LG</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {headingField || "Company"}
                </p>
                <p className="text-xs text-gray-500">Navigation Menu</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

