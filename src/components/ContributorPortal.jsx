import React, { useState, useEffect } from "react";

// Preset beautiful Unsplash categories for easy mockup uploads
const PRESET_MOCK_IMAGES = [
  {
    name: "Vibrant Vector Art",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: "vectors"
  },
  {
    name: "Corporate Office Desk PSD",
    url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80",
    category: "psds"
  },
  {
    name: "Beautiful Autumn Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    category: "photos"
  },
  {
    name: "Shiny Metallic Abstract 3D",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    category: "3d"
  },
  {
    name: "Modern Packaging PSD",
    url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
    category: "psds"
  },
  {
    name: "Breathtaking Snowy Peaks",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    category: "photos"
  }
];

export default function ContributorPortal({ 
  assets, 
  activeTab, 
  setActiveTab,
  getStats, 
  onUpload, 
  onWithdraw 
}) {
  const [activeContributor, setActiveContributor] = useState("DesignWave");
  
  // Form Upload states
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("vectors");
  const [uploadType, setUploadType] = useState("free");
  const [selectedPresetImage, setSelectedPresetImage] = useState(PRESET_MOCK_IMAGES[0]);
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [uploadTags, setUploadTags] = useState(["design", "resource", "new"]);
  const [uploadingProgress, setUploadingProgress] = useState(-1); // -1 = idle
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Contributors list for switching
  const contributors = ["DesignWave", "MockupMaster", "NatureLens", "CyberCore"];

  const [stats, setStats] = useState(null);

  // Fetch contributor statistics asynchronously
  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      const s = await getStats(activeContributor);
      if (active) {
        setStats(s);
      }
    };
    fetchStats();
    return () => {
      active = false;
    };
  }, [activeContributor, assets, activeTab]);

  const activeStats = stats || {
    earnings: 0,
    balance: 0,
    totalDownloads: 0,
    approvedCount: 0,
    pendingCount: 0,
    chartData: []
  };

  // Get contributor assets
  const contributorAssets = assets.filter(a => a.contributor === activeContributor);

  // Filter preset images based on selected category to guide user
  const availablePresets = PRESET_MOCK_IMAGES.filter(p => p.category === uploadCategory);

  useEffect(() => {
    // Keep presets updated when category changes
    if (availablePresets.length > 0) {
      setSelectedPresetImage(availablePresets[0]);
    }
  }, [uploadCategory]);

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (cleaned && !uploadTags.includes(cleaned)) {
        setUploadTags([...uploadTags, cleaned]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setUploadTags(uploadTags.filter((_, i) => i !== indexToRemove));
  };

  const handleWithdrawClick = () => {
    if (activeStats.balance > 0) {
      onWithdraw(activeContributor);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
      }, 3000);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;

    // Simulate upload progress
    setUploadingProgress(0);
    const interval = setInterval(() => {
      setUploadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Actually add asset to database
          const newAsset = {
            title: uploadTitle.trim(),
            category: uploadCategory,
            type: uploadType,
            contributor: activeContributor,
            imageUrl: customImageUrl.trim() || selectedPresetImage.url,
            tags: uploadTags.length > 0 ? uploadTags : [uploadCategory, "design"]
          };
          
          onUpload(newAsset);

          // Reset Form
          setUploadTitle("");
          setCustomImageUrl("");
          setUploadTags(["design", "resource"]);
          setUploadingProgress(-1);
          setUploadSuccess(true);
          
          setTimeout(() => {
            setUploadSuccess(false);
            setActiveTab("submissions"); // Navigate to submission tracker
          }, 1500);

          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Find peak download value to scale the SVG chart
  const maxDownloadsInChart = Math.max(...activeStats.chartData.map(d => d.downloads), 1);

  return (
    <div className="container portal-container">
      {/* 1. Header controls (Switch active contributor) */}
      <div className="portal-title-row">
        <div>
          <h2 style={{ fontSize: "2rem" }}>Contributor Dashboard</h2>
          <p style={{ color: "var(--text-secondary)" }}>Manage your uploads and check earnings analytics.</p>
        </div>

        <div className="flex align-center gap-2">
          <span className="form-label" style={{ margin: 0 }}>Active Profile:</span>
          <select
            className="filter-select"
            value={activeContributor}
            onChange={(e) => {
              setActiveContributor(e.target.value);
              setUploadSuccess(false);
            }}
            style={{ padding: "10px 16px", fontWeight: "600" }}
          >
            {contributors.map(c => (
              <option key={c} value={c}>🎨 {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. TAB SUB-NAVIGATION */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
        <button 
          className={`category-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
          style={{ borderRadius: "8px" }}
        >
          📊 Stats & Analytics
        </button>
        <button 
          className={`category-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
          style={{ borderRadius: "8px" }}
        >
          📤 Upload New Asset
        </button>
        <button 
          className={`category-tab ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
          style={{ borderRadius: "8px" }}
        >
          📁 Submission Manager ({contributorAssets.length})
        </button>
      </div>

      {/* 3. TABS CONTENT */}

      {/* --- DASHBOARD TAB --- */}
      {activeTab === "dashboard" && (
        <div>
          {/* Stats Cards Row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">⬇️</div>
              <div>
                <div className="stat-value">{activeStats.totalDownloads}</div>
                <div className="stat-label">Total Downloads</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">💰</div>
              <div>
                <div className="stat-value">${activeStats.earnings.toFixed(2)}</div>
                <div className="stat-label">All-time Earnings</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-gold">💳</div>
              <div style={{ flex: 1 }}>
                <div className="stat-value">${activeStats.balance.toFixed(2)}</div>
                <div className="stat-label">Withdrawable Balance</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">📁</div>
              <div>
                <div className="stat-value">{activeStats.approvedCount}</div>
                <div className="stat-label">Approved Assets</div>
              </div>
            </div>
          </div>

          {/* Withdrawal & Chart Box */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px", alignItems: "start" }}>
            
            {/* Download/Earnings Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3 style={{ fontSize: "1.2rem", marginBottom: "4px" }}>Weekly Downloads Performance</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Simulated traffic details for the last 7 days</p>
              </div>

              <div className="chart-container">
                {activeStats.chartData.map((dayData, index) => {
                  // Calculate height percent
                  const heightPercent = (dayData.downloads / maxDownloadsInChart) * 80 + 10;
                  return (
                    <div key={index} className="chart-bar-wrapper">
                      <div 
                        className="chart-bar"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="chart-tooltip">
                          <div>Downloads: <strong>{dayData.downloads}</strong></div>
                          <div>Est: <strong>${dayData.earnings.toFixed(2)}</strong></div>
                        </div>
                      </div>
                      <span className="chart-label">{dayData.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Withdraw Section */}
            <div className="card" style={{ padding: "32px", textAlign: "center" }}>
              <span style={{ fontSize: "2.5rem" }}>🏦</span>
              <h3 style={{ marginTop: "16px", marginBottom: "8px" }}>Payout Center</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Transfer your balance directly into your simulated bank account. Minimum threshold: $0.00.
              </p>

              <div style={{ padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
                <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>Available Balance</span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: activeStats.balance > 0 ? "var(--success)" : "var(--text-secondary)", marginTop: "4px" }}>
                  ${activeStats.balance.toFixed(2)}
                </div>
              </div>

              <button
                className="btn btn-success"
                onClick={handleWithdrawClick}
                disabled={activeStats.balance <= 0}
                style={{ width: "100%", opacity: activeStats.balance <= 0 ? 0.5 : 1, cursor: activeStats.balance <= 0 ? "not-allowed" : "pointer" }}
              >
                💸 Withdraw Earnings
              </button>

              {withdrawSuccess && (
                <div 
                  style={{ 
                    marginTop: "16px", 
                    color: "var(--success)", 
                    fontSize: "0.85rem", 
                    fontWeight: "600",
                    animation: "slideUp 0.2s ease" 
                  }}
                >
                  ✓ Payout initiated! Balance transferred.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- UPLOAD RESOURCE TAB --- */}
      {activeTab === "upload" && (
        <form onSubmit={handleUploadSubmit}>
          {uploadingProgress >= 0 ? (
            // Uploading state
            <div className="card" style={{ padding: "80px 24px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
              <span style={{ fontSize: "3rem", display: "inline-block", animation: "spin 2s linear infinite" }}>⏳</span>
              <h3 style={{ marginTop: "24px", marginBottom: "12px" }}>Uploading Resource...</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>Checking dimensions and file compliance</p>
              
              <div style={{ width: "100%", height: "8px", backgroundColor: "var(--bg-tertiary)", borderRadius: "99px", overflow: "hidden" }}>
                <div 
                  style={{ 
                    width: `${uploadingProgress}%`, 
                    height: "100%", 
                    backgroundColor: "var(--primary)", 
                    transition: "width 0.2s ease" 
                  }}
                ></div>
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-primary)", marginTop: "8px", display: "block" }}>
                {uploadingProgress}% Complete
              </span>
            </div>
          ) : uploadSuccess ? (
            // Upload success state
            <div className="card" style={{ padding: "80px 24px", textAlign: "center", maxWidth: "600px", margin: "0 auto", borderColor: "var(--success)" }}>
              <span style={{ fontSize: "4rem" }}>🎉</span>
              <h3 style={{ marginTop: "24px", color: "var(--success)", marginBottom: "8px" }}>Resource Submitted!</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Your asset is now in the Admin review queue. You will be redirected shortly...
              </p>
            </div>
          ) : (
            // Standard form
            <div className="upload-form-panel">
              {/* Left Form controls */}
              <div>
                <h3 style={{ marginBottom: "20px", fontSize: "1.2rem" }}>Asset Details</h3>
                
                <div className="form-group">
                  <label className="form-label">Asset Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Vintage Floral Hand-drawn Pattern" 
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-control"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                    >
                      <option value="vectors">Vectors</option>
                      <option value="photos">Photos</option>
                      <option value="psds">PSDs</option>
                      <option value="3d">3D Assets</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">License Type</label>
                    <select 
                      className="form-control"
                      value={uploadType}
                      onChange={(e) => setUploadType(e.target.value)}
                    >
                      <option value="free">Free Standard</option>
                      <option value="premium">👑 Premium License</option>
                    </select>
                  </div>
                </div>

                {/* Tag Input */}
                <div className="form-group">
                  <label className="form-label">Tags (Press Enter to add)</label>
                  <div className="tags-input-wrapper">
                    {uploadTags.map((tag, idx) => (
                      <span key={idx} className="tag-input-chip">
                        #{tag}
                        <span 
                          className="tag-input-chip-remove" 
                          onClick={() => handleRemoveTag(idx)}
                        >
                          ×
                        </span>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      className="tag-text-field"
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Minimum 1 tag recommended. Do not include spaces in tags.
                  </span>
                </div>

                {/* Custom Image URL input */}
                <div className="form-group" style={{ marginTop: "12px" }}>
                  <label className="form-label">Custom Image URL (Optional)</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    placeholder="https://images.unsplash.com/..." 
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                  />
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Leave blank to use a preset template from the side panel.
                  </span>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "12px", marginTop: "16px" }}
                >
                  🚀 Submit for Admin Review
                </button>
              </div>

              {/* Right preview box and preset selector */}
              <div>
                <h3 style={{ marginBottom: "20px", fontSize: "1.2rem" }}>Select Preview Graphic</h3>
                
                <div className="preview-box">
                  <img 
                    src={customImageUrl.trim() || selectedPresetImage.url} 
                    alt="Preview graphic" 
                    className="preview-img"
                  />
                </div>

                {!customImageUrl.trim() && (
                  <div style={{ marginTop: "20px" }}>
                    <span className="form-label" style={{ display: "block", marginBottom: "8px" }}>
                      Select a Preset Image for your {uploadCategory}:
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                      {availablePresets.map((preset, idx) => (
                        <div 
                          key={idx}
                          style={{
                            border: `2px solid ${selectedPresetImage.name === preset.name ? 'var(--primary)' : 'var(--border-color)'}`,
                            borderRadius: "6px",
                            overflow: "hidden",
                            aspectRatio: "4/3",
                            cursor: "pointer"
                          }}
                          onClick={() => setSelectedPresetImage(preset)}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.name} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      )}

      {/* --- SUBMISSIONS MANAGER TAB --- */}
      {activeTab === "submissions" && (
        <div>
          {contributorAssets.length === 0 ? (
            <div className="card" style={{ padding: "80px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
              <span style={{ fontSize: "3rem" }}>📁</span>
              <h3 style={{ marginTop: "16px" }}>You haven't uploaded any assets yet</h3>
              <p style={{ marginTop: "8px" }}>Go to the "Upload New Asset" tab to add your first creative asset.</p>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Asset Details</th>
                    <th>Category</th>
                    <th>Downloads</th>
                    <th>License</th>
                    <th>Status</th>
                    <th>Admin Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {contributorAssets.map(asset => (
                    <tr key={asset.id}>
                      <td>
                        <div className="table-img-cell">
                          <img src={asset.imageUrl} alt={asset.title} className="table-img" />
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{asset.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID: {asset.id}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                          {asset.category.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600" }}>{asset.downloads}</td>
                      <td>
                        <span className={`badge ${asset.type === 'premium' ? 'badge-premium' : 'badge-free'}`}>
                          {asset.type === 'premium' ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${asset.status}`}>
                          {asset.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem", color: asset.status === 'rejected' ? 'var(--danger)' : 'var(--text-secondary)', maxWidth: "220px", wordBreak: "break-word" }}>
                        {asset.feedback || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
