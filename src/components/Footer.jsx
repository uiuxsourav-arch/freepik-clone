import React from "react";

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="flex flex-col align-center gap-2">
          <p style={{ fontWeight: "600", color: "var(--text-primary)" }}>
            🎨 Freepik Clone Simulator Sandbox
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", maxWidth: "600px" }}>
            This application simulates a stock graphics sharing platform. Switch roles between User, Contributor, and Admin in the bottom right corner to test the full submission, review, download, and analytics cycles.
          </p>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--text-muted)" }}>Built with Vite + React + Vanilla CSS</span>
            <span style={{ color: "var(--text-muted)" }}>•</span>
            <span style={{ color: "var(--text-muted)" }}>LocalStorage Database Mock</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
