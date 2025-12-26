"use client";
import { useState } from "react";
import { IonButtons, IonButton } from "@ionic/react";
import { Menu, X, ChevronDown } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { HeaderProps } from "../_SwitcherComps/HeaderSwitcher";

export default function HeaderSix({
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

  const navigate = (url: string) => (window.location.href = url);

  const handleDropdown = (cfg: any) => {
    if (openDropdown === cfg.key) return setOpenDropdown(null);
    setOpenDropdown(cfg.key);
    fetchDropdownItems(cfg.key, cfg.apiEndpoint);
  };

  const currentPath = window.location.pathname;

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-[var(--scolor)] text-[var(--theme-primary-text)] shadow-md"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-[var(--theme-text-primary)] flex items-center justify-center p-1">
                {contactData?.Thumbnail ? (
                  <img
                    src={`${IMAGE_URL}/uploads/${contactData.Thumbnail}`}
                    className="w-full h-full object-contain"
                    alt="Logo"
                  />
                ) : (
                  <span className="text-[var(--scolor)] font-bold text-xs">LOGO</span>
                )}
              </div>

              {headingField && (
                <h1 className="text-base sm:text-lg font-bold hidden xs:block">{headingField}</h1>
              )}
            </button>

            {/* Desktop Menu */}
            {showRightButtons && (
              <nav className="hidden md:flex items-center gap-1">
                {menuItems.map((m) => {
                  const cfg = finalDropdowns.find((d) => d.key === m.key);
                  const active = currentPath === m.url;
                  const opened = openDropdown === cfg?.key;

                  if (m.hasSubmenu && cfg) {
                    return (
                      <button
                        key={m.label}
                        onClick={() => handleDropdown(cfg)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all ${active || opened
                          ? "bg-black/25 shadow-inner"
                          : "hover:bg-black/15"
                          }`}
                      >
                        {m.label}
                        <ChevronDown size={16} className={`transition-transform duration-200 ${opened ? "rotate-180" : ""}`} />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={m.label}
                      onClick={() => navigate(m.url)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${active
                        ? "bg-black/25 shadow-inner"
                        : "hover:bg-black/15"
                        }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-black/10 active:bg-black/20 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {menuItems.map((m) => {
                const cfg = finalDropdowns.find((d) => d.key === m.key);
                const active = currentPath === m.url;
                const opened = openDropdown === cfg?.key;

                if (m.hasSubmenu && cfg) {
                  return (
                    <div key={m.label}>
                      <button
                        onClick={() => handleDropdown(cfg)}
                        className={`flex justify-between w-full px-4 py-3 rounded-lg transition-colors ${opened ? "bg-black/30" : "bg-[var(--scolor-contrast)]"} text-white`}
                      >
                        <div className="flex items-center gap-2">
                          {m.label}
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${opened ? "rotate-180" : ""}`}
                        />
                      </button>

                      {opened && (
                        <div className="pl-4 pr-2 py-2 space-y-2">
                          {dropdownData[cfg.key]?.map((item: any, i: number) => (
                            <button
                              key={i}
                              className="w-full text-left px-4 py-2 rounded bg-[var(--theme-text-primary)] text-[var(--theme-secondary-bg)] hover:bg-[var(--theme-text-secondary)] transition-colors shadow-sm"
                              onClick={() => {
                                navigate(
                                  cfg.urlPattern.replace(
                                    "{id}",
                                    String(item[cfg.idField] || "")
                                  )
                                );
                                setIsMenuOpen(false);
                              }}
                            >
                              {item[cfg.titleField]}
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
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${active ? "bg-black/20" : "bg-[var(--scolor-contrast)] hover:bg-[var(--scolor)]"
                      }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>
    </>
  );
}

