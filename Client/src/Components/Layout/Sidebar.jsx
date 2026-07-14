import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Compass,
  MessageSquare,
  Map,
  Star,
  ShieldAlert,
  Users,
  BarChart2,
  LogOut,
  Landmark,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
/**
 * Left navigation sidebar shared across every dashboard page.
 *
 * @param {Object} props
 * @param {string} [props.brandName='Admin'] - Text next to the logo mark.
 * @param {string} [props.brandSubtitle='Platform Manager']
 * @param {boolean} [props.showLogo=true] - Show the small square brand icon above the nav.
 * @param {'logout'|'logout-pill'|'status'|'none'} [props.footer='logout'] - What to render at the bottom of the sidebar.
 * @param {{status: 'operational'|'issue', label: string}} [props.systemStatus] - Used when footer='status'.
 */
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/guides", label: "Guides", icon: Compass },
  { to: "/chats", label: "Chats", icon: MessageSquare },
  { to: "/places", label: "Places", icon: Map },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/users", label: "Users", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: BarChart2 },
];


export default function Sidebar({
  brandName = "Admin",
  brandSubtitle = "Platform Manager",
  showLogo = true,
  footer = "logout",
  isOpen,
  onClose,
}) {
  const navigate = useNavigate();
  const handleLogout = () => {
    // clear both, since "Remember me" decided which one Login.jsx used
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <aside
      className={`w-60 flex-shrink-0 bg-white border-r border-surface-border h-screen flex flex-col z-50 transition-transform duration-300 ease-in-out
                  fixed lg:sticky top-0
                  ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="px-6 pt-6 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showLogo && (
            <div className="w-9 h-9 rounded-lg bg-[#fe6800] text-white flex items-center justify-center flex-shrink-0">
              <Landmark size={18} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[#fe6800] font-bold leading-tight truncate">
              {brandName}
            </p>
            <p className="text-xs text-ink-400 truncate">{brandSubtitle}</p>
          </div>
        </div>
        <button
          type="button"
          className="lg:hidden text-ink-400 hover:text-ink-700"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#fe6800] text-white shadow-card"
                  : "text-ink-500 hover:bg-surface hover:text-ink-700"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {footer === "logout" && (
        <div className="px-4 pb-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-500 hover:bg-surface hover:text-status-red transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}

      {footer === "logout-pill" && (
        <div className="px-4 pb-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-semibold text-[#fe6800] bg-[#fe6800] hover:bg-[#fe6800] transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
