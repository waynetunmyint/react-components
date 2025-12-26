import { useState } from "react";
import {
  IonButtons,
  IonButton,
} from "@ionic/react";
import { Menu, X, Home, BookOpen, Users, DollarSign, Mail, TextSearch, SquaresExclude } from "lucide-react";
import { APP_BG_COLOR, IMAGE_URL, LOGO_NAME } from "../../config";

interface Props {
  headingField?: string;
  showRightButtons?: boolean;
}

export default function HeaderComp({ headingField, showRightButtons = true }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Detect current url path (e.g. "/client")
  const currentPath = window.location.pathname;

  const menuItems = [
    { label: "HOME", url: "/", icon: Home },
    { label: "BLOG", url: "/blog", icon: BookOpen },
    { label: "Teachers", url: "/teacher", icon: SquaresExclude },
    { label: "Course", url: "/course", icon: DollarSign },
    { label: "CONTACT", url: "/contact", icon: Mail },
  ];

  const handleNavigation = (url: string) => {
    window.location.href = url;
    setIsMenuOpen(false);
  };

  return (
    <header className={`${APP_BG_COLOR}  border-b`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left - Logo */}
          <IonButtons>
            <IonButton
              className="hover:opacity-80 transition"
              onClick={() => (window.location.href = "/")}
            >
              <img
                src={`${IMAGE_URL}/uploads/${LOGO_NAME}.png`}
                className="object-contain rounded-lg w-12 h-12"
                alt="logo"
              />

              {/* Middle Title (Optional) */}
              {headingField && (
                <div className="hidden md:block ml-2 text-white text-xl font-bold">
                  {headingField}
                </div>
              )}
            </IonButton>
          </IonButtons>

          {/* Desktop Navigation */}
          {showRightButtons && (
            <nav className="hidden md:flex gap-6 text-sm">
              {menuItems.map((item) => {
                const Icon = item.icon;

                const isActive = currentPath === item.url;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.url)}
                    className={`flex items-center gap-2 transition ${
                      isActive
                        ? "text-yellow-400 font-bold"
                        : "text-white hover:text-yellow-400"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Mobile Menu Button */}
          {showRightButtons && (
            <button
              className="md:hidden text-white p-2 hover:bg-blue-800 rounded-lg transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {showRightButtons && isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.url;

                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigation(item.url)}
                    className={`flex items-center gap-3 text-left py-3 px-4 rounded-lg transition ${
                      isActive
                        ? "bg-blue-800 text-yellow-400 font-bold"
                        : "text-white hover:bg-blue-800"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
