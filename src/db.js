import { supabase, isSupabaseConfigured } from "./supabaseClient";

// --- LOCAL STORAGE BACKEND FALLBACKS (from original implementation) ---
const INITIAL_ASSETS = [
  {
    id: "asset-1",
    title: "Minimalist Abstract Pastel Landscape",
    category: "vectors",
    type: "free",
    contributor: "DesignWave",
    downloads: 1240,
    likes: 85,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["abstract", "landscape", "pastel", "minimalist", "vector", "art"],
    createdDate: "2026-05-10T10:00:00.000Z",
    feedback: ""
  },
  {
    id: "asset-2",
    title: "Modern Business Card Mockup",
    category: "psds",
    type: "premium",
    contributor: "MockupMaster",
    downloads: 420,
    likes: 62,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80",
    tags: ["mockup", "business card", "psd", "corporate", "branding", "clean"],
    createdDate: "2026-05-12T14:30:00.000Z",
    feedback: ""
  },
  {
    id: "asset-3",
    title: "Golden Hour Mountain Range",
    category: "photos",
    type: "free",
    contributor: "NatureLens",
    downloads: 3205,
    likes: 412,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    tags: ["photo", "nature", "mountains", "sunset", "golden hour", "landscape"],
    createdDate: "2026-05-15T08:15:00.000Z",
    feedback: ""
  },
  {
    id: "asset-4",
    title: "Futuristic 3D Gadget Interface",
    category: "3d",
    type: "premium",
    contributor: "CyberCore",
    downloads: 185,
    likes: 45,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
    tags: ["3d", "render", "futuristic", "gadget", "cyberpunk", "ui"],
    createdDate: "2026-05-18T18:45:00.000Z",
    feedback: ""
  },
  {
    id: "asset-5",
    title: "Flat Line Web Development Illustration",
    category: "vectors",
    type: "free",
    contributor: "DesignWave",
    downloads: 980,
    likes: 54,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    tags: ["vector", "illustration", "web design", "development", "flat line"],
    createdDate: "2026-05-20T11:20:00.000Z",
    feedback: ""
  },
  {
    id: "asset-6",
    title: "Office Desk Workspace Mockup",
    category: "psds",
    type: "free",
    contributor: "MockupMaster",
    downloads: 1540,
    likes: 98,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80",
    tags: ["mockup", "workspace", "desk", "imac", "psd", "apple", "keyboard"],
    createdDate: "2026-05-22T09:10:00.000Z",
    feedback: ""
  },
  {
    id: "asset-7",
    title: "Moody Forest Foggy Trees",
    category: "photos",
    type: "premium",
    contributor: "NatureLens",
    downloads: 240,
    likes: 74,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    tags: ["photo", "nature", "forest", "fog", "moody", "trees"],
    createdDate: "2026-05-25T16:05:00.000Z",
    feedback: ""
  },
  {
    id: "asset-8",
    title: "Glossy Metallic 3D Spheres",
    category: "3d",
    type: "free",
    contributor: "CyberCore",
    downloads: 650,
    likes: 39,
    status: "approved",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["3d", "spheres", "metallic", "abstract", "shape", "render"],
    createdDate: "2026-05-28T13:40:00.000Z",
    feedback: ""
  },
  {
    id: "asset-9",
    title: "Modern Poster Mockup in Brick Wall",
    category: "psds",
    type: "premium",
    contributor: "MockupMaster",
    downloads: 0,
    likes: 0,
    status: "pending",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    tags: ["mockup", "poster", "psd", "frame", "brick wall", "interior"],
    createdDate: "2026-06-21T10:15:00.000Z",
    feedback: ""
  },
  {
    id: "asset-10",
    title: "Vibrant Summer Fruit Pattern Vector",
    category: "vectors",
    type: "free",
    contributor: "DesignWave",
    downloads: 0,
    likes: 0,
    status: "pending",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["vector", "pattern", "fruit", "summer", "vibrant", "background"],
    createdDate: "2026-06-22T08:30:00.000Z",
    feedback: ""
  }
];

const INITIAL_CONTRIBUTORS = {
  "DesignWave": { earnings: 154.50, balance: 154.50 },
  "MockupMaster": { earnings: 310.00, balance: 310.00 },
  "NatureLens": { earnings: 120.00, balance: 120.00 },
  "CyberCore": { earnings: 92.50, balance: 92.50 }
};

const getLocalData = () => {
  if (!localStorage.getItem("freepik_assets")) {
    localStorage.setItem("freepik_assets", JSON.stringify(INITIAL_ASSETS));
  }
  if (!localStorage.getItem("freepik_contributors")) {
    localStorage.setItem("freepik_contributors", JSON.stringify(INITIAL_CONTRIBUTORS));
  }
  if (!localStorage.getItem("freepik_favorites")) {
    localStorage.setItem("freepik_favorites", JSON.stringify([]));
  }

  return {
    assets: JSON.parse(localStorage.getItem("freepik_assets")),
    contributors: JSON.parse(localStorage.getItem("freepik_contributors")),
    favorites: JSON.parse(localStorage.getItem("freepik_favorites"))
  };
};

const updateLocalData = (data) => {
  localStorage.setItem("freepik_assets", JSON.stringify(data.assets));
  localStorage.setItem("freepik_contributors", JSON.stringify(data.contributors));
  localStorage.setItem("freepik_favorites", JSON.stringify(data.favorites));
};

// --- HYBRID EXPORTS ---
export const db = {
  // Check active mode
  isCloudMode: () => {
    return isSupabaseConfigured();
  },

  // --- ASSETS ---
  getAllAssets: async () => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("createdDate", { ascending: false });
      
      if (!error && data) return data;
      console.error("Supabase error, falling back:", error);
    }
    return getLocalData().assets;
  },

  getApprovedAssets: async () => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("status", "approved")
        .order("downloads", { ascending: false });

      if (!error && data) return data;
    }
    return getLocalData().assets.filter(a => a.status === "approved");
  },

  getPendingAssets: async () => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("status", "pending")
        .order("createdDate", { ascending: false });

      if (!error && data) return data;
    }
    return getLocalData().assets.filter(a => a.status === "pending");
  },

  getAssetsByContributor: async (contributorName) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("contributor", contributorName)
        .order("createdDate", { ascending: false });

      if (!error && data) return data;
    }
    return getLocalData().assets.filter(a => a.contributor === contributorName);
  },

  addAssetSubmission: async (newAsset) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("assets")
        .insert([{
          downloads: 0,
          likes: 0,
          status: "pending",
          createdDate: new Date().toISOString(),
          feedback: "",
          ...newAsset
        }])
        .select();

      if (!error && data) return data[0];
      console.error("Supabase insert error:", error);
    }

    // LocalStorage Fallback
    const data = getLocalData();
    const asset = {
      id: "asset-" + (data.assets.length + 1) + "-" + Math.random().toString(36).substring(2, 6),
      downloads: 0,
      likes: 0,
      status: "pending",
      createdDate: new Date().toISOString(),
      feedback: "",
      ...newAsset
    };
    data.assets.push(asset);
    updateLocalData(data);
    return asset;
  },

  // --- ADMIN ACTIONS ---
  approveAsset: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("assets")
        .update({ status: "approved", feedback: "" })
        .eq("id", id);
      
      if (!error) return true;
    }

    // Fallback
    const data = getLocalData();
    const asset = data.assets.find(a => a.id === id);
    if (asset) {
      asset.status = "approved";
      asset.feedback = "";
      updateLocalData(data);
      return true;
    }
    return false;
  },

  rejectAsset: async (id, feedback) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("assets")
        .update({ status: "rejected", feedback: feedback || "Rejected" })
        .eq("id", id);

      if (!error) return true;
    }

    // Fallback
    const data = getLocalData();
    const asset = data.assets.find(a => a.id === id);
    if (asset) {
      asset.status = "rejected";
      asset.feedback = feedback || "Doesn't meet quality guidelines.";
      updateLocalData(data);
      return true;
    }
    return false;
  },

  deleteAsset: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", id);

      if (!error) return true;
    }

    // Fallback
    const data = getLocalData();
    data.assets = data.assets.filter(a => a.id !== id);
    data.favorites = data.favorites.filter(favId => favId !== id);
    updateLocalData(data);
    return true;
  },

  // --- FAVORITES ---
  getFavorites: async () => {
    return getLocalData().favorites;
  },

  toggleFavorite: async (id) => {
    const data = getLocalData();
    const index = data.favorites.indexOf(id);
    let isFav = false;
    let increment = 0;

    if (index === -1) {
      data.favorites.push(id);
      isFav = true;
      increment = 1;
    } else {
      data.favorites.splice(index, 1);
      isFav = false;
      increment = -1;
    }
    updateLocalData(data);

    if (isSupabaseConfigured()) {
      // Fetch current likes and update
      const { data: assetData } = await supabase.from("assets").select("likes").eq("id", id).single();
      if (assetData) {
        await supabase
          .from("assets")
          .update({ likes: Math.max(0, assetData.likes + increment) })
          .eq("id", id);
      }
    } else {
      const asset = data.assets.find(a => a.id === id);
      if (asset) {
        asset.likes = Math.max(0, asset.likes + increment);
        updateLocalData(data);
      }
    }
    return isFav;
  },

  // --- DOWNLOAD SIMULATION ---
  downloadAsset: async (id) => {
    if (isSupabaseConfigured()) {
      // 1. Fetch current download count
      const { data: assetData } = await supabase.from("assets").select("downloads, contributor, type").eq("id", id).single();
      if (assetData) {
        // 2. Increment downloads
        await supabase
          .from("assets")
          .update({ downloads: assetData.downloads + 1 })
          .eq("id", id);
        
        // 3. Log simulated download in downloads table
        await supabase
          .from("downloads")
          .insert([{ asset_id: id }]);

        return true;
      }
    }

    // Fallback
    const data = getLocalData();
    const asset = data.assets.find(a => a.id === id);
    if (asset && asset.status === "approved") {
      asset.downloads += 1;

      const contributor = asset.contributor;
      if (!data.contributors[contributor]) {
        data.contributors[contributor] = { earnings: 0, balance: 0 };
      }
      const payRate = asset.type === "premium" ? 0.80 : 0.05;
      data.contributors[contributor].earnings += payRate;
      data.contributors[contributor].balance += payRate;

      updateLocalData(data);
      return true;
    }
    return false;
  },

  // --- CONTRIBUTOR ANALYTICS ---
  getContributorStats: async (contributorName) => {
    if (isSupabaseConfigured()) {
      // 1. Get contributor assets
      const { data: assets, error } = await supabase
        .from("assets")
        .select("*")
        .eq("contributor", contributorName);
      
      // 2. Get past withdrawals payouts
      const { data: payouts } = await supabase
        .from("payouts")
        .select("amount")
        .eq("contributor", contributorName);

      if (!error && assets) {
        const totalDownloads = assets.reduce((sum, a) => sum + a.downloads, 0);
        const approvedCount = assets.filter(a => a.status === "approved").length;
        const pendingCount = assets.filter(a => a.status === "pending").length;

        // Calculate earnings: Premium ($0.80) / Free ($0.05)
        let earnings = 0;
        assets.forEach(a => {
          const rate = a.type === "premium" ? 0.80 : 0.05;
          earnings += (a.downloads * rate);
        });

        const totalWithdrawn = payouts ? payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0;
        const balance = Math.max(0, earnings - totalWithdrawn);

        // Simulated daily download chart details
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayStr = date.toLocaleDateString(undefined, { weekday: "short" });
          
          const seed = (earnings * 10) % 20;
          const downloads = Math.round((totalDownloads / 30) + (Math.sin(i) * 5) + seed + 2);
          const dayEarnings = downloads * (assets.some(a => a.type === "premium") ? 0.40 : 0.05);

          chartData.push({
            day: dayStr,
            downloads: Math.max(0, downloads),
            earnings: parseFloat(Math.max(0, dayEarnings).toFixed(2))
          });
        }

        return {
          earnings: parseFloat(earnings.toFixed(2)),
          balance: parseFloat(balance.toFixed(2)),
          totalDownloads,
          approvedCount,
          pendingCount,
          chartData
        };
      }
    }

    // Fallback
    const data = getLocalData();
    const assets = data.assets.filter(a => a.contributor === contributorName);
    const contributorMeta = data.contributors[contributorName] || { earnings: 0, balance: 0 };
    const totalDownloads = assets.reduce((sum, a) => sum + a.downloads, 0);
    const approvedCount = assets.filter(a => a.status === "approved").length;
    const pendingCount = assets.filter(a => a.status === "pending").length;

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString(undefined, { weekday: "short" });
      const seed = (contributorMeta.earnings * 10) % 20;
      const downloads = Math.round((totalDownloads / 30) + (Math.sin(i) * 5) + seed + 2);
      const earnings = downloads * (assets.some(a => a.type === "premium") ? 0.40 : 0.05);

      chartData.push({
        day: dayStr,
        downloads: Math.max(0, downloads),
        earnings: parseFloat(Math.max(0, earnings).toFixed(2))
      });
    }

    return {
      earnings: parseFloat(contributorMeta.earnings.toFixed(2)),
      balance: parseFloat(contributorMeta.balance.toFixed(2)),
      totalDownloads,
      approvedCount,
      pendingCount,
      chartData
    };
  },

  withdrawEarnings: async (contributorName) => {
    if (isSupabaseConfigured()) {
      // Fetch stats to know available balance
      const stats = await db.getContributorStats(contributorName);
      if (stats.balance > 0) {
        await supabase
          .from("payouts")
          .insert([{ contributor: contributorName, amount: stats.balance }]);
        return true;
      }
      return false;
    }

    // Fallback
    const data = getLocalData();
    if (data.contributors[contributorName] && data.contributors[contributorName].balance > 0) {
      data.contributors[contributorName].balance = 0;
      updateLocalData(data);
      return true;
    }
    return false;
  },

  // --- ADMIN ANALYTICS ---
  getAdminStats: async () => {
    if (isSupabaseConfigured()) {
      const { data: assets } = await supabase.from("assets").select("*");
      const { data: payouts } = await supabase.from("payouts").select("amount");

      if (assets) {
        const totalAssets = assets.length;
        const approvedAssets = assets.filter(a => a.status === "approved").length;
        const pendingAssets = assets.filter(a => a.status === "pending").length;
        const rejectedAssets = assets.filter(a => a.status === "rejected").length;
        const totalDownloads = assets.reduce((sum, a) => sum + a.downloads, 0);

        const totalPayouts = payouts ? payouts.reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0;
        
        // Find count of unique contributors
        const uniqueContributors = new Set(assets.map(a => a.contributor));

        const categoryStats = { vectors: 0, photos: 0, psds: 0, "3d": 0 };
        assets.forEach(a => {
          if (categoryStats[a.category] !== undefined) {
            categoryStats[a.category]++;
          }
        });

        return {
          totalAssets,
          approvedAssets,
          pendingAssets,
          rejectedAssets,
          totalDownloads,
          totalPayouts: parseFloat(totalPayouts.toFixed(2)),
          activeContributors: uniqueContributors.size || 1,
          categoryStats
        };
      }
    }

    // Fallback
    const data = getLocalData();
    const totalAssets = data.assets.length;
    const approvedAssets = data.assets.filter(a => a.status === "approved").length;
    const pendingAssets = data.assets.filter(a => a.status === "pending").length;
    const rejectedAssets = data.assets.filter(a => a.status === "rejected").length;
    const totalDownloads = data.assets.reduce((sum, a) => sum + a.downloads, 0);
    
    let totalPayouts = 0;
    Object.values(data.contributors).forEach(c => {
      totalPayouts += c.earnings;
    });

    const activeContributors = Object.keys(data.contributors).length;

    const categoryStats = { vectors: 0, photos: 0, psds: 0, "3d": 0 };
    data.assets.forEach(a => {
      if (categoryStats[a.category] !== undefined) {
        categoryStats[a.category]++;
      }
    });

    return {
      totalAssets,
      approvedAssets,
      pendingAssets,
      rejectedAssets,
      totalDownloads,
      totalPayouts: parseFloat(totalPayouts.toFixed(2)),
      activeContributors,
      categoryStats
    };
  }
};
