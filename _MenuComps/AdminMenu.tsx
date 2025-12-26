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
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

    const fetchMenu = async () => {
      try {
        // 1. Show cached data FIRST (immediate UI render)
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data } = JSON.parse(cached);
            if (data && data.length > 0) {
              console.log('📦 Showing cached admin menu data');
              setMenuData(data);
              setLoading(false);
            }
          } catch (parseErr) {
            console.warn('Failed to parse cache, removing:', parseErr);
            localStorage.removeItem(CACHE_KEY);
          }
        }

        // 2. ALWAYS fetch fresh data in background
        console.log('🔄 Fetching fresh admin menu data...');
        const res = await fetch(`${BASE_URL}/adminMenu/api/byPageId/${PAGE_ID}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const freshData = await res.json();
        const menuItems = Array.isArray(freshData) ? freshData : freshData.rows || [];

        // 3. Replace localStorage with fresh data
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: menuItems,
          timestamp: Date.now()
        }));

        console.log('✅ Admin menu updated with fresh data');
        setMenuData(menuItems);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
        // If we already showed cache, keep it; otherwise try fallback
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached && menuData.length === 0) {
          try {
            const { data } = JSON.parse(cached);
            if (data && data.length > 0) {
              console.log('⚠️ Using cached data as fallback after fetch error');
              setMenuData(data);
            }
          } catch { /* ignore parse errors */ }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loading) {
    return (
      <div id="admin-menu-sidebar" className="fixed top-0 left-0 w-72 h-full bg-[#004D25] flex items-center justify-center z-40">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="loading-text text-sm text-white/70">Loading menu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <BillChecker />
      {/* Backdrop overlay - solid black since no transparency allowed */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black z-30 sm:hidden animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button - always visible on top */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
        style={{
          backgroundColor: '#004D25',
          color: 'white',
          borderColor: '#006400'
        }}
        className="sm:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-[#006400] group"
      >
        {isOpen ? (
          <X className="w-5 h-5 toggle-icon transition-transform duration-200" />
        ) : (
          <Menu className="w-5 h-5 toggle-icon transition-transform duration-200" />
        )}
      </button>

      {/* Sidebar - highest z-index */}
      <aside
        id="admin-menu-sidebar"
        className={`fixed top-0 left-0 z-40 w-72 h-full bg-[#004D25] border-r border-[#00381b] shadow-2xl transition-all duration-300 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Header with improved styling */}
          <div className="px-2 py-2 border-b border-[#00381b] bg-[#00381b]">
            <div className="flex items-center justify-between">
              <button
                onClick={() => window.location.href = "/"}
                className="flex items-center gap-2 hover:opacity-90 transition-all group flex-1"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md bg-white text-[#004D25]"
                >
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-left font-bold portal-title text-white">Admin Panel</p>
                </div>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1.5 rounded-lg bg-[#00381b] text-white/70 close-btn hover:!text-red-400 hover:bg-red-950 transition-all border border-[#006400]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Access Actions */}
          {pathname.startsWith("/admin") && (
            <div className="px-2 pt-3 pb-1">
              <button
                onClick={() => setIsCustomerChatOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-95 border border-[#006400] group"
                style={{
                  background: 'linear-gradient(135deg, #00602e 0%, #00381b 100%)',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                  <MessageCircle size={20} strokeWidth={2.5} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-tighter text-white">Customer Support</p>
                  <p className="text-[10px] text-white/70 font-medium">Manage Guest Conversations</p>
                </div>
              </button>
            </div>
          )}

          {/* Menu List with improved items */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <ul className="space-y-0.5">
              {menuData.map((item, idx) => {
                const isActive = pathname === item.LinkURL;
                return (
                  <li key={idx}>
                    <a
                      href={item.LinkURL}
                      className={`menu-link group flex items-center gap-2 px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${isActive ? "active" : ""}`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-white shadow-md text-[#004D25]' : 'bg-[#00381b] text-white/70 group-hover:bg-[#00602e] group-hover:text-white'}`}>
                        <File size={12} strokeWidth={2} className="menu-icon transition-colors" />
                      </div>
                      <p className="flex-1 admin-title truncate text-white">{item.Title}</p>
                      <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-all duration-200 ${isActive ? '!opacity-100 text-white' : 'text-white/50'} group-hover:translate-x-0.5`} />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer with improved user section */}
          <div className="border-t border-[#00381b] bg-[#002612]">
            <div className="flex items-center gap-2 px-2 py-2 bg-[#00381b] border border-[#006400]/30 hover:bg-[#004D25] transition-all duration-200">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] user-email truncate text-white/70">{user?.Email || user?.email || "admin@example.com"}</p>
              </div>
              {pathname.startsWith("/admin") && (
                <>
                  <button
                    onClick={() => setIsCustomerChatOpen(true)}
                    className="p-1.5 customer-chat-btn rounded-lg transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 flex items-center gap-2 bg-white text-[#004D25]"
                    title="Customer Chats"
                  >
                    <MessageCircle size={14} strokeWidth={2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider pr-1 text-[#004D25]">Chat</span>
                  </button>
                  <button
                    onClick={() => setIsSupportChatOpen(true)}
                    className="p-1.5 support-chat-btn rounded-lg transition-all duration-200 border border-[#006400] bg-[#004D25] hover:bg-[#00602e] hover:scale-105"
                    title="Support Settings"
                  >
                    <Settings size={14} strokeWidth={2} className="text-white/70" />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  ["StoredUser", "StoredJWT", "StoredPage", "StoredEncryptedPage"].forEach(k => localStorage.removeItem(k));
                  window.location.href = "/login";
                }}
                className="p-1.5 logout-btn hover:bg-red-950/50 rounded-lg transition-all duration-200 text-red-400"
                title="Logout"
              >
                <LogOut size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        #admin-menu-sidebar * {
          box-sizing: border-box !important;
        }
        #admin-menu-sidebar .scrollbar-thin::-webkit-scrollbar {
          width: 4px !important;
        }
        #admin-menu-sidebar .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent !important;
        }
        #admin-menu-sidebar .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #00602e !important;
          border-radius: 2px !important;
        }
        #admin-menu-sidebar .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #00753a !important;
        }
        #admin-menu-sidebar .menu-link {
          color: rgba(255,255,255,0.7) !important;
          background-color: transparent !important;
        }
        #admin-menu-sidebar .menu-link:hover {
          background-color: #00602e !important;
          color: white !important;
        }
        #admin-menu-sidebar .menu-link.active {
          background: #00602e !important;
          border: 1px solid #00753a !important;
        }
        #admin-menu-sidebar .menu-icon {
          color: inherit !important;
        }
        #admin-menu-sidebar .menu-link:hover .menu-icon {
          color: white !important;
        }
        #admin-menu-sidebar .menu-link.active .menu-icon {
          color: #004D25 !important;
        }
        #admin-menu-sidebar .logout-btn {
          color: rgb(248 113 113) !important;
        }
        #admin-menu-sidebar .logout-btn svg {
          color: rgb(248 113 113) !important;
        }
        #admin-menu-sidebar .user-name {
          color: white !important;
        }
        #admin-menu-sidebar .admin-title {
          color: white !important;
        }
        #admin-menu-sidebar .user-email {
          color: rgba(255,255,255,0.6) !important;
        }
        #admin-menu-sidebar .copyright-text {
          color: rgba(255,255,255,0.4) !important;
        }
        #admin-menu-sidebar .loading-text {
          color: rgba(255,255,255,0.6) !important;
        }
        #admin-menu-sidebar .portal-title {
          color: white !important;
        }
        #admin-menu-sidebar .portal-subtitle {
          color: rgba(255,255,255,0.6) !important;
        }
        #admin-menu-sidebar .toggle-icon {
          color: white !important;
        }
        #admin-menu-sidebar .close-btn {
          color: rgba(255,255,255,0.6) !important;
        }
        #admin-menu-sidebar .close-btn:hover {
          color: rgb(248 113 113) !important;
        }
        #admin-menu-sidebar .support-chat-btn {
          transition: all 0.2s ease;
        }
        #admin-menu-sidebar .support-chat-btn:hover {
          opacity: 0.85;
          transform: scale(1.05);
        }
      `}</style>

      {/* Support Chat Modal */}
      <SupportChatModal
        isOpen={isSupportChatOpen}
        onClose={() => setIsSupportChatOpen(false)}
      />

      {/* Customer Chat Modal */}
      <CustomerChatModal
        isOpen={isCustomerChatOpen}
        onClose={() => setIsCustomerChatOpen(false)}
      />
    </div>
  );
}
