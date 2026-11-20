import React from "react";

export default function Header({ currentRole, theme, toggleTheme, activeTab, setActiveTab }) {
  const getNavLinks = () => {
    switch (currentRole) {
      case "user":
        return [
          { id: "home", label: "Explore" },
          { id: "favorites", label: "My Favorites" }
        ];
      case "contributor":
        return [
          { id: "dashboard", label: "Earnings Dashboard" },
          { id: "upload", label: "Upload Resource" },
          { id: "submissions", label: "My Submissions" }
        ];
      case "admin":
        return [
          { id: "overview", label: "Admin Console" },
          { id: "reviews", label: "Review Queue" },
          { id: "all-assets", label: "Assets Directory" }
        ];
      default:
        return [];
    }
  };

  const getRoleBadgeColor = () => {
    switch (currentRole) {
      case "admin": return "var(--danger)";
      case "contributor": return "#a855f7";
      default: return "var(--primary)";
    }
  };

  return (
    <nav className="header-nav">
      <div className="container flex align-center justify-between" style={{ height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setActiveTab(getNavLinks()[0]?.id || "home"); }}>
            🎨 Freepik<span>Clone</span>
          </a>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: getRoleBadgeColor(), 
              color: "white", 
              fontSize: "0.7rem", 
              borderRadius: "4px",
              padding: "4px 8px"
            }}
          >
            {currentRole.toUpperCase()} VIEW
          </span>
        </div>

        <ul className="nav-links">
          {getNavLinks().map(link => (
            <li key={link.id}>
              <a
                href="#"
                className={activeTab === link.id ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(link.id);
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex align-center gap-3">
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            style={{ fontSize: "1.2rem" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}
