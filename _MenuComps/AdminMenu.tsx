import { useState, useEffect } from "react";
import { Menu, X, LogOut, File, Home, ChevronRight, MessageCircle, Users, Settings } from "lucide-react";
import { BASE_URL, PAGE_ID } from "../../../config";
import BillChecker from "../BillComps/BillChecker";
import SupportChatModal from "./SupportChatModal";
import CustomerChatModal from "./CustomerChatModal";

interface MenuItem {
  Title: string;
  LinkURL: string;
  Icon?: string;
  Badge?: string;
}

export default function AdminMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false);
  const [isCustomerChatOpen, setIsCustomerChatOpen] = useState(false);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const user = localStorage.getItem('StoredUser') ? JSON.parse(localStorage.getItem('StoredUser')!) : null;

  useEffect(() => {
    if (!user) return void (window.location.href = "/login");

    const CACHE_KEY = `adminMenu_cache_${PAGE_ID}`;

    const fetchMenu = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data } = JSON.parse(cached);
            if (data && data.length > 0) {
              setMenuData(data);
              setLoading(false);
            }
          } catch (e) { localStorage.removeItem(CACHE_KEY); }
        }

        const res = await fetch(`${BASE_URL}/adminMenu/api/byPageId/${PAGE_ID}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const freshData = await res.json();
        const menuItems = Array.isArray(freshData) ? freshData : freshData.rows || [];

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: menuItems,
          timestamp: Date.now()
        }));

        setMenuData(menuItems);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loading) {
    return (
      <div id="admin-menu-loading" className="fixed top-0 left-0 w-72 h-full flex items-center justify-center z-40 bg-[var(--accent-600)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--accent-500)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--accent-500)] text-xs font-medium tracking-wider">LOADING</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-menu-container">
      <BillChecker />

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden animate-fadeIn backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 mobile-toggle"
      >
        {isOpen ? <X className="w-5 h-5 text-[var(--text-light)]" /> : <Menu className="w-5 h-5 text-[var(--text-light)]" />}
      </button>

      {/* Sidebar */}
      <aside
        id="admin-menu-sidebar"
        className={`fixed top-0 left-0 z-40 w-72 h-full shadow-2xl transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-6 border-b border-[var(--text-light)]/5">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.location.href = "/"}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-500)] flex items-center justify-center shadow-lg transform group-hover:rotate-3 transition-all duration-300">
                <Home className="w-5 h-5 text-[var(--text-light)]" />
              </div>
              <div>
                <h2 className="text-[var(--text-light)] font-bold tracking-tight">Welcome</h2>
                <p className="text-[var(--accent-500)] text-[10px] font-bold uppercase tracking-widest">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Quick Actions (Admin Only) */}
          {pathname.startsWith("/admin") && (
            <div className="px-4 py-4">
              <button
                onClick={() => setIsCustomerChatOpen(true)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-[var(--text-light)]/5 hover:bg-[var(--text-light)]/10 border border-[var(--text-light)]/5 transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--accent-500)]/20 flex items-center justify-center text-[var(--accent-500)] group-hover:scale-110 transition-transform">
                  <MessageCircle size={18} />
                </div>
                <div className="text-left">
                  <p className="text-[var(--text-light)] text-xs font-bold">Support Chat</p>
                  <p className="text-[var(--text-light)]/40 text-[10px]">View messages</p>
                </div>
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            {menuData.map((item, idx) => {
              const isActive = pathname === item.LinkURL;
              return (
                <a
                  key={idx}
                  href={item.LinkURL}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive ? "bg-[var(--accent-500)] shadow-lg" : "hover:bg-[var(--text-light)]/5"
                    }`}
                >
                  <div className={`p-1.5 rounded-md transition-colors ${isActive ? "bg-[var(--text-light)]/20 text-[var(--text-light)]" : "bg-[var(--text-light)]/5 text-[var(--text-light)]/60 group-hover:text-[var(--text-light)] group-hover:bg-[var(--text-light)]/10"}`}>
                    <File size={14} />
                  </div>
                  <span className={`text-sm font-medium flex-1 truncate ${isActive ? "text-[var(--text-light)]" : "text-[var(--text-light)]/70 group-hover:text-[var(--text-light)]"}`}>
                    {item.Title}
                  </span>
                  {isActive && <ChevronRight size={14} className="text-[var(--text-light)]/80" />}
                </a>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-[var(--text-light)]/5 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--text-light)]/5 border border-[var(--text-light)]/5">
              <div className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center border border-[var(--text-light)]/10">
                <span className="text-xs font-bold text-[var(--accent-500)]">{user?.Email?.[0]?.toUpperCase() || "A"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-light)]/90 font-medium truncate">Admin User</p>
                <p className="text-[10px] text-[var(--text-light)]/40 truncate">{user?.Email || "admin@example.com"}</p>
              </div>
              <button
                onClick={() => {
                  ["StoredUser", "StoredJWT", "StoredPage", "StoredEncryptedPage"].forEach(k => localStorage.removeItem(k));
                  window.location.href = "/login";
                }}
                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-light)]/40 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Internal CSS */}
      <style>{`
        /* Self-contained styling for Royal Forest Admin Sidebar */
        #admin-menu-sidebar {
          background: linear-gradient(180deg, var(--accent-600) 0%, #00381b 100%);
          color: var(--text-light);
        }

        .mobile-toggle {
          background: var(--accent-500);
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      <SupportChatModal isOpen={isSupportChatOpen} onClose={() => setIsSupportChatOpen(false)} />
      <CustomerChatModal isOpen={isCustomerChatOpen} onClose={() => setIsCustomerChatOpen(false)} />
    </div>
  );
}
