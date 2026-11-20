import React, { useState, useEffect } from "react";
import "./App.css";
import { db } from "./db";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RoleSwitcher from "./components/RoleSwitcher";
import UserPortal from "./components/UserPortal";
import ContributorPortal from "./components/ContributorPortal";
import AdminPortal from "./components/AdminPortal";
import AuthForm from "./components/AuthForm";

function App() {
  const [role, setRole] = useState("user");
  const [theme, setTheme] = useState("light");
  const [activeTab, setActiveTab] = useState("home");
  
  // App-wide state
  const [user, setUser] = useState(null); // stores authenticated user/session
  const [assets, setAssets] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Load and refresh state from database mock
  const reloadData = async () => {
    try {
      const allAssets = await db.getAllAssets();
      const favs = await db.getFavorites();
      setAssets(allAssets);
      setFavorites(favs);
    } catch (err) {
      console.error("Error reloading database data:", err);
    }
  };

  // On mount: init theme and load data, setup Supabase listeners if configured
  useEffect(() => {
    reloadData();
    
    // Theme setup
    const savedTheme = localStorage.getItem("freepik_theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Supabase auth subscription if keys are provided
    if (isSupabaseConfigured()) {
      // 1. Check current session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
          await handleSessionLoad(session);
        }
      });

      // 2. Listen to changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          await handleSessionLoad(session);
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const handleSessionLoad = async (session) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      const authUser = {
        email: session.user.email,
        username: profile?.username || session.user.email.split("@")[0],
        role: profile?.role || "user",
        id: session.user.id
      };
      
      setUser(authUser);
      setRole(authUser.role);
      
      // Select appropriate initial tab for the role
      if (authUser.role === "user") setActiveTab("home");
      else if (authUser.role === "contributor") setActiveTab("dashboard");
      else if (authUser.role === "admin") setActiveTab("overview");
    } catch (err) {
      console.error("Error loading user profile:", err);
    }
  };

  // Handle theme toggling
  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("freepik_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Handle role swapping (only available in mock sandbox mode)
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (user && !isSupabaseConfigured()) {
      // Keep sandbox mock user role synced
      setUser({ ...user, role: newRole });
    }
    
    if (newRole === "user") {
      setActiveTab("home");
    } else if (newRole === "contributor") {
      setActiveTab("dashboard");
    } else if (newRole === "admin") {
      setActiveTab("overview");
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setRole(authenticatedUser.role);
    if (authenticatedUser.role === "user") setActiveTab("home");
    else if (authenticatedUser.role === "contributor") setActiveTab("dashboard");
    else if (authenticatedUser.role === "admin") setActiveTab("overview");
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setRole("user");
    setActiveTab("home");
  };

  // --- DATABASE WRAPPER ACTIONS ---
  const handleDownload = async (id) => {
    await db.downloadAsset(id);
    await reloadData();
  };

  const handleToggleFavorite = async (id) => {
    await db.toggleFavorite(id);
    await reloadData();
  };

  const handleUpload = async (newAsset) => {
    await db.addAssetSubmission(newAsset);
    await reloadData();
  };

  const handleApprove = async (id) => {
    await db.approveAsset(id);
    await reloadData();
  };

  const handleReject = async (id, feedback) => {
    await db.rejectAsset(id, feedback);
    await reloadData();
  };

  const handleDelete = async (id) => {
    await db.deleteAsset(id);
    await reloadData();
  };

  const handleWithdraw = async (contributorName) => {
    await db.withdrawEarnings(contributorName);
    await reloadData();
  };

  return (
    <>
      {/* Dynamic Header Nav */}
      <Header 
        currentRole={role}
        theme={theme}
        toggleTheme={handleToggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Sandbox Workspace */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!user ? (
          // Authenticate first if session not active
          <AuthForm 
            onAuthSuccess={handleAuthSuccess} 
            currentTheme={theme}
          />
        ) : (
          // Render Portal layouts based on role
          <>
            {/* Show user sign-out status bar */}
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              borderBottom: "1px solid var(--border-color)",
              padding: "10px 24px",
              fontSize: "0.85rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>
                Logged in as <strong>{user.username}</strong> ({user.email})
                {isSupabaseConfigured() && <span style={{ color: "var(--success)", marginLeft: "8px" }}>● Connected to Supabase</span>}
              </span>
              <button 
                onClick={handleSignOut}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--danger)",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.85rem"
                }}
              >
                Sign Out 🚪
              </button>
            </div>

            {role === "user" && (
              <UserPortal 
                assets={assets}
                favorites={favorites}
                activeTab={activeTab}
                onDownload={handleDownload}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {role === "contributor" && (
              <ContributorPortal 
                assets={assets}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                getStats={db.getContributorStats}
                onUpload={handleUpload}
                onWithdraw={handleWithdraw}
              />
            )}

            {role === "admin" && (
              <AdminPortal 
                assets={assets}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                getAdminStats={db.getAdminStats}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </main>

      {/* Float Role Selector Switcher (Available only in credentials-free sandbox mode) */}
      {!isSupabaseConfigured() && (
        <RoleSwitcher 
          currentRole={role}
          onChangeRole={handleRoleChange}
        />
      )}

      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
