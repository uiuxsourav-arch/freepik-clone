import React, { useState, useEffect } from "react";

export default function AdminPortal({ 
  assets, 
  activeTab, 
  setActiveTab,
  getAdminStats, 
  onApprove, 
  onReject, 
  onDelete 
}) {
  const [rejectionFeedback, setRejectionFeedback] = useState({});
  const [showRejectForm, setShowRejectForm] = useState({});
  const [adminStats, setAdminStats] = useState(null);

  // Fetch admin statistics asynchronously using useEffect
  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      const s = await getAdminStats();
      if (active) {
        setAdminStats(s);
      }
    };
    fetchStats();
    return () => {
      active = false;
    };
  }, [assets, activeTab]);

  const stats = adminStats || {
    totalAssets: 0,
    approvedAssets: 0,
    pendingAssets: 0,
    rejectedAssets: 0,
    totalDownloads: 0,
    totalPayouts: 0,
    activeContributors: 0,
    categoryStats: { vectors: 0, photos: 0, psds: 0, "3d": 0 }
  };

  // Get pending submissions
  const pendingAssets = assets.filter(a => a.status === "pending");

  // Get approved assets
  const approvedAssets = assets.filter(a => a.status === "approved");

  const handleApprove = (id) => {
    onApprove(id);
  };

  const handleRejectClick = (id) => {
    setShowRejectForm({ ...showRejectForm, [id]: true });
    if (!rejectionFeedback[id]) {
      setRejectionFeedback({ ...rejectionFeedback, [id]: "Does not meet our quality guidelines. Please check contrast and tagging." });
    }
  };

  const handleRejectSubmit = (id) => {
    onReject(id, rejectionFeedback[id]);
    // Reset state
    const updatedForm = { ...showRejectForm };
    delete updatedForm[id];
    setShowRejectForm(updatedForm);
  };

  const handleCancelReject = (id) => {
    const updatedForm = { ...showRejectForm };
    delete updatedForm[id];
    setShowRejectForm(updatedForm);
  };

  const handleDeleteClick = (id) => {
    if (confirm("Are you sure you want to permanently delete this asset? This cannot be undone.")) {
      onDelete(id);
    }
  };

  return (
    <div className="container portal-container">
      {/* 1. Header Row */}
      <div className="portal-title-row">
        <div>
          <h2 style={{ fontSize: "2rem" }}>Admin Review & Console</h2>
          <p style={{ color: "var(--text-secondary)" }}>Audit uploaded creative files, check analytics, and manage platform listings.</p>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
        <button 
          className={`category-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{ borderRadius: "8px" }}
        >
          📈 System Overview
        </button>
        <button 
          className={`category-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
          style={{ borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          📥 Pending Reviews 
          {pendingAssets.length > 0 && (
            <span style={{ backgroundColor: "var(--danger)", color: "white", padding: "2px 6px", borderRadius: "50%", fontSize: "0.75rem", fontWeight: "bold" }}>
              {pendingAssets.length}
            </span>
          )}
        </button>
        <button 
          className={`category-tab ${activeTab === 'all-assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-assets')}
          style={{ borderRadius: "8px" }}
        >
          ⚙️ Manage Live Assets ({approvedAssets.length})
        </button>
      </div>

      {/* 3. TABS CONTENT */}

      {/* --- SYSTEM OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div>
          {/* Stats Cards Row */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">📈</div>
              <div>
                <div className="stat-value">{stats.totalAssets}</div>
                <div className="stat-label">Total Submissions</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">⬇️</div>
              <div>
                <div className="stat-value">{stats.totalDownloads}</div>
                <div className="stat-label">Total Downloads</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-gold">💰</div>
              <div>
                <div className="stat-value">${stats.totalPayouts.toFixed(2)}</div>
                <div className="stat-label">Creator Payouts</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-red">👥</div>
              <div>
                <div className="stat-value">{stats.activeContributors}</div>
                <div className="stat-label">Active Contributors</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            {/* Submission Status split */}
            <div className="card">
              <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Submissions Status Distribution</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Approved */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                    <span style={{ fontWeight: 600 }}>Approved (Live)</span>
                    <span style={{ color: "var(--text-secondary)" }}>{stats.approvedAssets} Assets ({stats.totalAssets > 0 ? Math.round((stats.approvedAssets / stats.totalAssets) * 100) : 0}%)</span>
                  </div>
                  <div style={{ height: "8px", backgroundColor: "var(--bg-tertiary)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${stats.totalAssets > 0 ? (stats.approvedAssets / stats.totalAssets) * 100 : 0}%`, height: "100%", backgroundColor: "var(--success)" }}></div>
                  </div>
                </div>

                {/* Pending */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                    <span style={{ fontWeight: 600 }}>Pending Review</span>
                    <span style={{ color: "var(--text-secondary)" }}>{stats.pendingAssets} Assets ({stats.totalAssets > 0 ? Math.round((stats.pendingAssets / stats.totalAssets) * 100) : 0}%)</span>
                  </div>
                  <div style={{ height: "8px", backgroundColor: "var(--bg-tertiary)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${stats.totalAssets > 0 ? (stats.pendingAssets / stats.totalAssets) * 100 : 0}%`, height: "100%", backgroundColor: "var(--accent)" }}></div>
                  </div>
                </div>

                {/* Rejected */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                    <span style={{ fontWeight: 600 }}>Rejected</span>
                    <span style={{ color: "var(--text-secondary)" }}>{stats.rejectedAssets} Assets ({stats.totalAssets > 0 ? Math.round((stats.rejectedAssets / stats.totalAssets) * 100) : 0}%)</span>
                  </div>
                  <div style={{ height: "8px", backgroundColor: "var(--bg-tertiary)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${stats.totalAssets > 0 ? (stats.rejectedAssets / stats.totalAssets) * 100 : 0}%`, height: "100%", backgroundColor: "var(--danger)" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category breakdown progress bars */}
            <div className="card">
              <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Category Inventory Breakdown</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {Object.entries(stats.categoryStats).map(([cat, count]) => {
                  const pct = stats.totalAssets > 0 ? Math.round((count / stats.totalAssets) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                        <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{cat}</span>
                        <span style={{ color: "var(--text-secondary)" }}>{count} items ({pct}%)</span>
                      </div>
                      <div style={{ height: "8px", backgroundColor: "var(--bg-tertiary)", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "var(--primary)" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- REVIEW QUEUE TAB --- */}
      {activeTab === "reviews" && (
        <div>
          {pendingAssets.length === 0 ? (
            <div className="card" style={{ padding: "80px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
              <span style={{ fontSize: "3.5rem" }}>🌈</span>
              <h3 style={{ marginTop: "16px", color: "var(--success)" }}>Queue Cleared!</h3>
              <p style={{ marginTop: "8px" }}>All submitted resources have been processed. Excellent job!</p>
            </div>
          ) : (
            <div className="admin-grid">
              {pendingAssets.map(asset => (
                <div key={asset.id} className="review-item-card">
                  {/* Resource Image view */}
                  <div className="review-image-wrapper">
                    <img src={asset.imageUrl} alt={asset.title} className="review-image" />
                  </div>

                  {/* Metadata */}
                  <div className="review-meta">
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <span className="badge" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                        {asset.category.toUpperCase()}
                      </span>
                      <span className={`badge ${asset.type === 'premium' ? 'badge-premium' : 'badge-free'}`}>
                        {asset.type === 'premium' ? '👑 Premium' : 'Free'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>{asset.title}</h3>
                    
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      <div>Contributor: <strong>{asset.contributor}</strong></div>
                      <div>Uploaded: <strong>{new Date(asset.createdDate).toLocaleDateString()}</strong></div>
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Tags:</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {asset.tags.map(t => (
                          <span key={t} style={{ fontSize: "0.75rem", backgroundColor: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "4px" }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {!showRejectForm[asset.id] ? (
                      <div className="review-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleApprove(asset.id)}
                          style={{ flex: 1 }}
                        >
                          ✓ Approve & Publish
                        </button>
                        <button 
                          className="btn btn-outline"
                          onClick={() => handleRejectClick(asset.id)}
                          style={{ color: "var(--danger)", borderColor: "var(--danger-light)" }}
                        >
                          ✗ Reject...
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", animation: "slideUp 0.15s ease" }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.8rem" }}>Rejection Feedback</label>
                          <textarea
                            className="form-control modal-feedback-input"
                            value={rejectionFeedback[asset.id]}
                            onChange={(e) => setRejectionFeedback({ ...rejectionFeedback, [asset.id]: e.target.value })}
                            placeholder="State reason (e.g. copyright issues, quality check...)"
                            required
                          />
                        </div>

                        <div className="flex gap-2">
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleRejectSubmit(asset.id)}
                            style={{ flex: 1, padding: "8px" }}
                          >
                            Submit Rejection
                          </button>
                          <button 
                            className="btn btn-secondary"
                            onClick={() => handleCancelReject(asset.id)}
                            style={{ padding: "8px" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- ASSETS DIRECTORY TAB --- */}
      {activeTab === "all-assets" && (
        <div>
          {approvedAssets.length === 0 ? (
            <div className="card" style={{ padding: "80px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
              <span style={{ fontSize: "3rem" }}>🗄️</span>
              <h3 style={{ marginTop: "16px" }}>No active assets on the platform</h3>
              <p style={{ marginTop: "8px" }}>Assets approved through the Review Queue will appear here.</p>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Asset ID & Title</th>
                    <th>Contributor</th>
                    <th>Category</th>
                    <th>License</th>
                    <th>Downloads</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedAssets.map(asset => (
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
                      <td>👤 {asset.contributor}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                          {asset.category.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${asset.type === 'premium' ? 'badge-premium' : 'badge-free'}`}>
                          {asset.type === 'premium' ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600" }}>⬇️ {asset.downloads}</td>
                      <td>
                        <button
                          className="btn btn-outline"
                          onClick={() => handleDeleteClick(asset.id)}
                          style={{ padding: "6px 12px", fontSize: "0.8rem", color: "var(--danger)", borderColor: "var(--danger-light)" }}
                        >
                          🗑️ Remove
                        </button>
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
