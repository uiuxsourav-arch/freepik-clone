import React, { useState } from "react";

export default function RoleSwitcher({ currentRole, onChangeRole }) {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { id: "user", label: "User (Consumer)", icon: "👤", description: "Search, download, favorite assets" },
    { id: "contributor", label: "Contributor", icon: "🎨", description: "Upload, track downloads & earnings" },
    { id: "admin", label: "Admin Reviewer", icon: "🔑", description: "Approve uploads, check analytics" }
  ];

  return (
    <div className="role-switcher-container">
      <button 
        className="btn role-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>🎭</span> Switch Role: {roles.find(r => r.id === currentRole)?.label.split(" ")[0]}
      </button>

      {isOpen && (
        <div className="role-menu">
          <div className="role-menu-header">Select Simulator Role</div>
          {roles.map(role => (
            <button
              key={role.id}
              className={`role-option ${currentRole === role.id ? 'active' : ''}`}
              onClick={() => {
                onChangeRole(role.id);
                setIsOpen(false);
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>{role.icon}</span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "600" }}>{role.label}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "normal" }}>
                  {role.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
