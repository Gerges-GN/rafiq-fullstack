import React from "react";
import { Bell, Settings, LogOut, Menu } from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import SearchInput from "../common/SearchInput.jsx";
import { useNavigate } from "react-router-dom";

export default function Topbar({
  title,
  searchPlaceholder,
  showLogout = false,
  logoutVariant = "button",
  unread = false,
  onMenuClick,
}) {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );

  const handleLogout = () => {
    // clear both, since "Remember me" decided which one Login.jsx used
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-surface-border px-4 lg:px-8 py-4 flex items-center gap-4">
      <button
        type="button"
        className="lg:hidden text-ink-500"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-xl font-bold text-[#fe6800] flex-shrink-0 hidden sm:block">
        {title}
      </h1>

      {searchPlaceholder && (
        <SearchInput placeholder={searchPlaceholder} className="max-w-sm" />
      )}

      <div className="ml-auto flex items-center gap-5 flex-shrink-0">
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-ink-500 hover:bg-surface"
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-red ring-2 ring-white" />
          )}
        </button>
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-500 hover:bg-surface"
          aria-label="Settings"
        >
          <Settings size={19} />
        </button>

        {showLogout && logoutVariant === "button" && (
          <div className="w-px h-8 bg-surface-border" />
        )}

        <div className="flex items-center gap-3">
          <Avatar src={user?.avatarUrl} alt={user?.name} size="sm" />
          <div className="leading-tight hidden sm:block">
            <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="text-xs text-ink-400">{user?.role}</p>
          </div>
        </div>

        
      </div>
    </header>
  );
}