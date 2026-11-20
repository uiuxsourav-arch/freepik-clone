import React, { useState, useEffect } from "react";

export default function UserPortal({ 
  assets, 
  favorites, 
  activeTab, 
  onDownload, 
  onToggleFavorite, 
  onSearchTag 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [premiumFilter, setPremiumFilter] = useState("all"); // "all", "free", "premium"
  const [sortOrder, setSortOrder] = useState("popular"); // "popular", "new"
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Filter and sort assets
  const getFilteredAssets = () => {
    let list = assets.filter(a => a.status === "approved");

    // Tab filter (if my favorites tab is selected)
    if (activeTab === "favorites") {
      list = list.filter(a => favorites.includes(a.id));
    }

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter(a => a.category === selectedCategory);
    }

    // License filter
    if (premiumFilter === "free") {
      list = list.filter(a => a.type === "free");
    } else if (premiumFilter === "premium") {
      list = list.filter(a => a.type === "premium");
    }

    // Search query filter (matches title or tags)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortOrder === "popular") {
      list.sort((a, b) => b.downloads - a.downloads);
    } else if (sortOrder === "new") {
      list.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }

    return list;
  };

  const filteredAssets = getFilteredAssets();

  // If search via tag click from detail modal
  const handleTagClick = (tag) => {
    setSearchQuery(tag);
    setSelectedCategory("all");
    setSelectedAsset(null); // Close modal
  };

  const handleDownloadClick = (assetId) => {
    onDownload(assetId);
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2500);

    // Refresh selected asset details in modal
    if (selectedAsset && selectedAsset.id === assetId) {
      const updated = assets.find(a => a.id === assetId);
      setSelectedAsset(updated);
    }
  };

  // Find related assets (max 4, same category, excluding active one)
  const getRelatedAssets = (asset) => {
    if (!asset) return [];
    return assets
      .filter(a => a.status === "approved" && a.category === asset.category && a.id !== asset.id)
      .slice(0, 4);
  };

  const related = getRelatedAssets(selectedAsset);

  return (
    <div style={{ flex: 1 }}>
      {/* 1. Hero Search Section (Visible on Explore Home) */}
      {activeTab === "home" && (
        <div className="hero-banner">
          <h1 className="hero-title">
            Find the Perfect <span>Creative Asset</span>
          </h1>
          <p className="hero-subtitle">
            Download high-quality vectors, stock photos, PSD mockups, and 3D assets submitted by creators worldwide.
          </p>

          <div className="search-wrapper">
            <select 
              className="search-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Resources</option>
              <option value="vectors">Vectors</option>
              <option value="photos">Photos</option>
              <option value="psds">PSDs</option>
              <option value="3d">3D Assets</option>
            </select>

            <input 
              type="text" 
              className="search-input-field" 
              placeholder="Search vectors, mockups, photos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button className="search-btn">
              🔍
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="container">
        {/* Page Title for Favorites */}
        {activeTab === "favorites" && (
          <h2 style={{ fontSize: "2rem", marginTop: "32px", marginBottom: "16px" }}>
            ❤️ My Saved Collection ({filteredAssets.length})
          </h2>
        )}

        {/* 2. Filter & Sort controls bar */}
        <div className="filter-bar">
          <div className="category-tabs">
            {["all", "vectors", "photos", "psds", "3d"].map(cat => (
              <button
                key={cat}
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="filter-options">
            {/* Free/Premium Toggles */}
            <div 
              className={`toggle-container ${premiumFilter === "premium" ? "active" : ""}`}
              onClick={() => {
                if (premiumFilter === "all") setPremiumFilter("premium");
                else if (premiumFilter === "premium") setPremiumFilter("free");
                else setPremiumFilter("all");
              }}
            >
              <span className="form-label" style={{ margin: 0, fontSize: "0.85rem" }}>
                {premiumFilter === "all" ? "License: All" : premiumFilter === "premium" ? "👑 Premium Only" : "🆓 Free Only"}
              </span>
              <div className="toggle-switch"></div>
            </div>

            {/* Sort Select */}
            <select 
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="popular">Popularity</option>
              <option value="new">Latest Assets</option>
            </select>
          </div>
        </div>

        {/* 3. Asset Grid */}
        {filteredAssets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "3rem" }}>🔍</span>
            <h3 style={{ marginTop: "16px" }}>No assets found matching your criteria</h3>
            <p style={{ marginTop: "8px" }}>Try adjusting your filters or expanding your search term.</p>
          </div>
        ) : (
          <div className="asset-grid">
            {filteredAssets.map(asset => {
              const isFav = favorites.includes(asset.id);
              return (
                <div 
                  key={asset.id} 
                  className="asset-card"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <span className={`asset-badge badge ${asset.type === 'premium' ? 'badge-premium' : 'badge-free'}`}>
                    {asset.type === 'premium' ? '👑 Premium' : 'Free'}
                  </span>
                  
                  <img 
                    src={asset.imageUrl} 
                    alt={asset.title} 
                    className="asset-image" 
                    loading="lazy"
                  />

                  <div className="asset-hover-overlay">
                    <div className="asset-hover-top">
                      <button 
                        className={`asset-action-btn ${isFav ? 'liked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(asset.id);
                        }}
                      >
                        ❤️
                      </button>
                    </div>

                    <div className="asset-hover-bottom">
                      <h4 className="asset-card-title">{asset.title}</h4>
                      <div className="asset-card-meta">
                        <span className="contributor-name">👤 {asset.contributor}</span>
                        <div className="asset-stats-inline">
                          <span>⬇️ {asset.downloads}</span>
                          <span>❤️ {asset.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Asset Detail Modal */}
      {selectedAsset && (
        <div className="modal-backdrop" onClick={() => setSelectedAsset(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedAsset(null)}>✕</button>

            <div className="modal-grid">
              {/* Left Column: Image preview */}
              <div className="modal-image-panel">
                <img 
                  src={selectedAsset.imageUrl} 
                  alt={selectedAsset.title} 
                  className="modal-image-preview"
                />
              </div>

              {/* Right Column: Metadata & Actions */}
              <div className="modal-details-panel">
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className={`badge ${selectedAsset.type === 'premium' ? 'badge-premium' : 'badge-free'}`}>
                      {selectedAsset.type === 'premium' ? '👑 Premium' : 'Free'}
                    </span>
                    <span className="badge" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                      {selectedAsset.category.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="modal-title">{selectedAsset.title}</h3>

                  <div className="author-row">
                    <div className="author-avatar">
                      {selectedAsset.contributor.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Contributor</div>
                      <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{selectedAsset.contributor}</div>
                    </div>
                  </div>

                  {/* Stats list */}
                  <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
                    <div>
                      <div style={{ fontSize: "1.4rem", fontWeight: "700" }}>{selectedAsset.downloads}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Downloads</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "1.4rem", fontWeight: "700" }}>{selectedAsset.likes}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Likes</div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Download Action box */}
                  <div className="download-box">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "500" }}>
                        {selectedAsset.type === "premium" ? "👑 Requires Premium License" : "🆓 Free Standard License"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        className={`btn ${selectedAsset.type === 'premium' ? 'btn-premium' : 'btn-primary'}`}
                        style={{ flex: 1, padding: "14px" }}
                        onClick={() => handleDownloadClick(selectedAsset.id)}
                      >
                        ⬇️ Download Now
                      </button>

                      <button 
                        className={`btn btn-outline btn-icon-only ${favorites.includes(selectedAsset.id) ? 'liked' : ''}`}
                        onClick={() => onToggleFavorite(selectedAsset.id)}
                        style={{ width: "52px", height: "52px", fontSize: "1.2rem", borderColor: favorites.includes(selectedAsset.id) ? "var(--danger)" : "var(--border-color)" }}
                      >
                        ❤️
                      </button>
                    </div>

                    {downloadSuccess && (
                      <div 
                        style={{ 
                          marginTop: "12px", 
                          color: "var(--success)", 
                          fontSize: "0.85rem", 
                          fontWeight: "600",
                          textAlign: "center",
                          animation: "slideUp 0.2s ease" 
                        }}
                      >
                        ✓ Asset downloaded successfully! Contributor earnings updated.
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>Tags:</span>
                    <div className="tags-container">
                      {selectedAsset.tags.map(tag => (
                        <button 
                          key={tag}
                          className="tag-chip"
                          onClick={() => handleTagClick(tag)}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Assets Section */}
            {related.length > 0 && (
              <div style={{ padding: "24px 32px 40px", borderTop: "1px solid var(--border-color)" }}>
                <h4 style={{ marginBottom: "16px", fontSize: "1.1rem" }}>Related {selectedAsset.category}</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                  {related.map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        borderRadius: "8px", 
                        overflow: "hidden", 
                        aspectRatio: "4/3", 
                        cursor: "pointer",
                        position: "relative",
                        border: "1px solid var(--border-color)"
                      }}
                      onClick={() => setSelectedAsset(item)}
                    >
                      <img src={item.imageUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", color: "white", padding: "6px 10px", fontSize: "0.75rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
