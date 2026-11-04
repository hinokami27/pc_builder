import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSavedBuilds, updateBuild, deleteBuild, loadBuildToConfigurator } from '../utils/inventoryStorage';

const COMPONENT_SLOTS = [
  { id: 'cpu', label: 'CPU' },
  { id: 'cooler', label: 'COOLER' },
  { id: 'motherboard', label: 'MOTHERBOARD' },
  { id: 'gpu', label: 'GPU' },
  { id: 'ram', label: 'MEMORY' },
  { id: 'disk', label: 'STORAGE' },
  { id: 'case', label: 'CASE' },
  { id: 'psu', label: 'POWER SUPPLY' }
];

export default function InventoryPage() {
  const navigate = useNavigate();
  const [builds, setBuilds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const [editingBuildId, setEditingBuildId] = useState(null);
  const [editName, setEditName] = useState('');
  const [expandedBuildId, setExpandedBuildId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [loadedToast, setLoadedToast] = useState(null);

  // Load builds on mount and listen to storage update events
  const refreshBuilds = () => {
    setBuilds(getSavedBuilds());
  };

  useEffect(() => {
    refreshBuilds();
    const handleStorageUpdate = () => refreshBuilds();
    window.addEventListener('pc_inventory_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('pc_inventory_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  // Filter and sort builds
  const filteredBuilds = useMemo(() => {
    return builds
      .filter((b) => {
        if (sourceFilter !== 'ALL') {
          if (sourceFilter === 'AI' && b.source !== 'AI Rig Generator') return false;
          if (sourceFilter === 'MANUAL' && b.source === 'AI Rig Generator') return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = b.name.toLowerCase().includes(q);
          const partsMatch = Object.values(b.partsSnapshot || {}).some((part) => {
            if (Array.isArray(part)) {
              return part.some((p) => (p?.name || p?.modelName || '').toLowerCase().includes(q));
            }
            return (part?.name || part?.modelName || '').toLowerCase().includes(q);
          });
          const gameMatch = (b.games || []).some((g) => g.toLowerCase().includes(q));
          return nameMatch || partsMatch || gameMatch;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === 'price_desc') return (b.totalPrice || 0) - (a.totalPrice || 0);
        if (sortBy === 'price_asc') return (a.totalPrice || 0) - (b.totalPrice || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [builds, sourceFilter, searchQuery, sortBy]);

  // Rename action
  const handleStartRename = (build) => {
    setEditingBuildId(build.id);
    setEditName(build.name);
  };

  const handleSaveRename = (id) => {
    if (!editName.trim()) return;
    const updated = updateBuild(id, { name: editName.trim() });
    setBuilds(updated);
    setEditingBuildId(null);
  };

  // Delete action
  const handleDelete = (id) => {
    const updated = deleteBuild(id);
    setBuilds(updated);
    setDeleteConfirmId(null);
  };

  // Load to Configurator
  const handleLoadToConfigurator = (build) => {
    loadBuildToConfigurator(build.config);
    setLoadedToast(`Loaded "${build.name}" into Configurator! Redirecting...`);
    setTimeout(() => {
      navigate('/configurator');
    }, 600);
  };

  // Copy Bill of Materials / Export
  const handleCopyManifest = (build) => {
    const partsLines = [];
    partsLines.push(`=== MATRIX PC BUILD MANIFEST: ${build.name.toUpperCase()} ===`);
    partsLines.push(`Date Created: ${new Date(build.createdAt).toLocaleDateString()}`);
    partsLines.push(`Source: ${build.source}`);
    partsLines.push(`Total Cost: ${(build.totalPrice || 0).toLocaleString()} MKD`);
    if (build.estimatedWattage) partsLines.push(`Estimated Wattage: ~${build.estimatedWattage} W`);
    partsLines.push('--------------------------------------------------');

    COMPONENT_SLOTS.forEach((slot) => {
      const part = build.partsSnapshot?.[slot.id];
      if (Array.isArray(part)) {
        part.forEach((p, idx) => {
          partsLines.push(`${slot.label} #${idx + 1}: ${p.name || p.modelName || 'N/A'} - ${(p.price || p.priceMkd || 0).toLocaleString()} MKD (${p.storeName || 'Vendor'})`);
        });
      } else if (part) {
        partsLines.push(`${slot.label}: ${part.name || part.modelName || 'N/A'} - ${(part.price || part.priceMkd || 0).toLocaleString()} MKD (${part.storeName || 'Vendor'})`);
      } else if (slot.id === 'cooler' && build.source === 'AI Rig Generator') {
        partsLines.push(`${slot.label}: OEM Stock Air Cooler (Included with CPU) - 0 MKD`);
      }
    });

    partsLines.push('--------------------------------------------------');
    if (build.games?.length > 0) {
      partsLines.push(`Optimized For Games: ${build.games.join(', ')}`);
    }

    navigator.clipboard.writeText(partsLines.join('\n'));
    setCopiedId(build.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const calculateFpsBadge = (fps) => {
    if (!fps && fps !== 0) return { label: 'N/A', color: 'text-text-secondary border-border-muted bg-bg-main' };
    if (fps >= 60) return { label: `${fps} FPS`, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' };
    if (fps >= 35) return { label: `${fps} FPS`, color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' };
    return { label: `${fps} FPS`, color: 'text-red-400 border-red-500/40 bg-red-950/30' };
  };

  return (
    <div className="space-y-8 mb-16 font-chakra">
      {/* Toast Notification */}
      {loadedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-text-primary text-bg-main px-6 py-3 border border-border-focus shadow-2xl font-mono text-xs font-black tracking-wider uppercase animate-bounce">
          // {loadedToast}
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-border-muted pb-6 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="text-xs text-text-primary tracking-widest uppercase font-mono mb-1">
              // LOCAL_STORAGE_ARCHIVE
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-black text-text-accent tracking-widest uppercase">
              Build_Inventory
            </h1>
            <p className="text-text-secondary text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
              Manage your saved system configurations, inspect hardware snapshots, export manifests, or load any build directly back into the live Configurator.
            </p>
          </div>

          {/* Aggregate Inventory Stats - Total Saved only */}
          <div className="flex items-center gap-3">
            <div className="bg-bg-panel border border-border-muted p-3 px-5 text-right">
              <div className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">
                TOTAL SAVED
              </div>
              <div className="text-xl font-black text-text-primary">
                {builds.length} {builds.length === 1 ? 'RIG' : 'RIGS'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar & Search / Filters */}
      <div className="bg-bg-panel border border-border-muted p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved builds by title, part name, or game..."
            className="w-full bg-bg-main border border-border-muted focus:border-text-primary px-4 py-2.5 text-xs font-mono text-text-accent placeholder-text-secondary/50 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-text-secondary hover:text-text-accent font-mono"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and Sorters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Tabs */}
          <div className="flex border border-border-muted bg-bg-main p-0.5 text-xs font-mono">
            <button
              onClick={() => setSourceFilter('ALL')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${sourceFilter === 'ALL' ? 'bg-text-primary text-bg-main font-bold' : 'text-text-secondary hover:text-text-accent'
                }`}
            >
              ALL ({builds.length})
            </button>
            <button
              onClick={() => setSourceFilter('MANUAL')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${sourceFilter === 'MANUAL' ? 'bg-text-primary text-bg-main font-bold' : 'text-text-secondary hover:text-text-accent'
                }`}
            >
              CONFIGURATOR
            </button>
            <button
              onClick={() => setSourceFilter('AI')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${sourceFilter === 'AI' ? 'bg-text-primary text-bg-main font-bold' : 'text-text-secondary hover:text-text-accent'
                }`}
            >
              AI BUILDS
            </button>
          </div>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort builds by"
            className="bg-bg-main border border-border-muted px-3 py-2 text-xs font-mono text-text-secondary focus:border-text-primary outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="price_desc">Sort: Price (High → Low)</option>
            <option value="price_asc">Sort: Price (Low → High)</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>

          {/* Quick Create Links */}
          <Link
            to="/configurator"
            className="bg-text-primary text-bg-main px-3.5 py-2 text-xs font-black tracking-widest uppercase transition-all duration-75 border border-transparent shadow-[0_3px_0_0_rgb(73,12,133)] hover:bg-text-dulled hover:text-white active:translate-y-1 active:shadow-none cursor-pointer"
          >
            + Configurator
          </Link>
        </div>
      </div>

      {/* Build Cards Manifest Container */}
      {filteredBuilds.length === 0 ? (
        /* Empty State */
        <div className="bg-bg-panel border border-border-muted p-12 text-center space-y-6">
          <div className="w-20 h-16 border border-border-muted bg-bg-main flex items-center justify-center mx-auto text-xs font-mono font-bold text-text-secondary tracking-widest">
            [ EMPTY ]
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-text-accent uppercase tracking-widest font-display">
              {builds.length === 0 ? 'No Saved Builds in Inventory' : 'No Matching Manifests Found'}
            </h3>
            <p className="text-xs text-text-secondary font-mono max-w-md mx-auto leading-relaxed">
              {builds.length === 0
                ? 'Save your custom configurations from the Configurator or generate AI builds to compare, export, and load them at any time.'
                : 'Try adjusting your search keywords or filter settings.'}
            </p>
          </div>

          {builds.length === 0 && (
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link
                to="/configurator"
                className="bg-text-primary text-bg-main px-6 py-3 text-xs font-black tracking-widest uppercase transition-all duration-75 border border-transparent shadow-[0_4px_0_0_rgb(73,12,133)] hover:bg-text-dulled hover:text-white active:translate-y-1 active:shadow-none cursor-pointer"
              >
                Go to Configurator →
              </Link>
              <Link
                to="/rig-generator"
                className="px-6 py-3 text-xs font-bold tracking-widest text-text-accent uppercase border border-border-muted hover:border-text-primary hover:bg-white/5 transition-colors cursor-pointer"
              >
                Generate with AI →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBuilds.map((build) => {
            const isEditing = editingBuildId === build.id;
            const isExpanded = expandedBuildId === build.id;
            const isDeleting = deleteConfirmId === build.id;
            const isCopied = copiedId === build.id;

            const partsSnapshot = build.partsSnapshot || {};
            const partsCount = Object.values(partsSnapshot).reduce((acc, val) => {
              if (Array.isArray(val)) return acc + val.length;
              return acc + (val ? 1 : 0);
            }, 0);

            return (
              <div
                key={build.id}
                className="bg-bg-panel border border-border-muted hover:border-border-focus transition-colors flex flex-col"
              >
                {/* Build Card Top Header */}
                <div className="p-6 border-b border-border-muted flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-bg-main/40">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Source Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${build.source === 'AI Rig Generator'
                          ? 'text-purple-400 border-purple-500/40 bg-purple-950/20'
                          : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20'
                          }`}
                      >
                        {build.source === 'AI Rig Generator' ? 'AI RIG GENERATOR' : 'CONFIGURATOR'}
                      </span>

                      {/* Estimated Wattage */}
                      {build.estimatedWattage && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 border text-emerald-400 border-emerald-500/40 bg-emerald-950/20">
                          ~{build.estimatedWattage} WATT
                        </span>
                      )}

                      <span className="text-[11px] text-text-secondary font-mono">
                        Saved on {new Date(build.createdAt).toLocaleDateString()} at {new Date(build.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Editable Title */}
                    {isEditing ? (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(build.id);
                            if (e.key === 'Escape') setEditingBuildId(null);
                          }}
                          autoFocus
                          className="bg-bg-main border border-text-primary px-3 py-1 text-lg font-bold text-text-accent outline-none font-display uppercase tracking-wider"
                        />
                        <button
                          onClick={() => handleSaveRename(build.id)}
                          className="bg-text-primary text-bg-main px-3 py-1 text-xs font-bold uppercase cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingBuildId(null)}
                          className="text-text-secondary hover:text-text-accent px-2 py-1 text-xs font-mono uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-black text-text-accent uppercase tracking-wider font-display truncate">
                          {build.name}
                        </h2>
                        <button
                          onClick={() => handleStartRename(build)}
                          title="Rename build"
                          className="text-text-secondary hover:text-text-primary text-xs font-mono transition-colors cursor-pointer"
                        >
                          [Rename]
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Tag and Primary CTA */}
                  <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">
                        TOTAL COST ({partsCount} PARTS)
                      </div>
                      <div className="text-2xl font-black text-text-accent">
                        {(build.totalPrice || 0).toLocaleString()} ден.
                      </div>
                    </div>

                    <button
                      onClick={() => handleLoadToConfigurator(build)}
                      className="bg-text-primary text-bg-main px-4 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-75 border border-transparent shadow-[0_3px_0_0_rgb(73,12,133)] hover:bg-text-dulled hover:text-white active:translate-y-1 active:shadow-none cursor-pointer"
                    >
                      Open In Configurator →
                    </button>
                  </div>
                </div>

                {/* Hardware Components Snapshot Grid */}
                <div className="p-6 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-text-secondary flex justify-between items-center">
                    <span>// HARDWARE_SLOT_MANIFEST</span>
                    <button
                      onClick={() => setExpandedBuildId(isExpanded ? null : build.id)}
                      className="text-[11px] font-mono text-text-primary hover:underline cursor-pointer"
                    >
                      {isExpanded ? '[- Collapse Details]' : '[+ Expand All Specs & FPS]'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {COMPONENT_SLOTS.map((slot) => {
                      const partOrArray = partsSnapshot[slot.id];
                      const partsList = Array.isArray(partOrArray)
                        ? partOrArray
                        : (partOrArray ? [partOrArray] : []);

                      return (
                        <div
                          key={slot.id}
                          className="bg-bg-main border border-border-muted p-3 space-y-2 flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-center border-b border-border-muted/50 pb-1.5">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-text-primary font-mono">
                              {slot.label}
                            </span>
                            <span className="text-[9px] text-text-secondary font-mono">
                              {partsList.length > 0 ? `${partsList.length} ALLOCATED` : 'NONE'}
                            </span>
                          </div>

                          {partsList.length > 0 ? (
                            <div className="space-y-2">
                              {partsList.map((p, idx) => (
                                <div key={idx} className="flex items-start gap-2.5">
                                  {(p.imageUrl || p.imgUrl) ? (
                                    <img
                                      src={p.imageUrl || p.imgUrl}
                                      alt={p.name || p.modelName}
                                      referrerPolicy="no-referrer"
                                      className="w-10 h-10 object-contain border border-border-muted p-1 bg-bg-panel shrink-0"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-10 h-10 border border-border-muted bg-bg-panel flex items-center justify-center text-[8px] text-text-secondary font-mono shrink-0">
                                      HARDWARE
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    {(p.storeUrl || p.url) ? (
                                      <Link
                                        to={`/product/details?type=${slot.id}&url=${encodeURIComponent(p.storeUrl || p.url)}`}
                                        className="text-xs font-bold text-text-accent hover:text-text-primary line-clamp-1 transition-colors block"
                                        title={p.name || p.modelName}
                                      >
                                        {p.name || p.modelName}
                                      </Link>
                                    ) : (
                                      <div className="text-xs font-bold text-text-accent line-clamp-1" title={p.name || p.modelName}>
                                        {p.name || p.modelName}
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono mt-0.5">
                                      <span>{p.storeName || 'Vendor'}</span>
                                      <span className="text-text-accent font-bold">
                                        {(p.price || p.priceMkd || 0).toLocaleString()} ден.
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : slot.id === 'cooler' && build.source === 'AI Rig Generator' ? (
                            <div className="text-[11px] font-mono text-emerald-400">
                              Stock OEM Cooler Included
                            </div>
                          ) : (
                            <div className="text-[11px] font-mono text-text-secondary/60">
                              -- Slot Unallocated --
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Telemetry Section (for AI builds) */}
                  {isExpanded && (
                    <div className="border-t border-border-muted pt-4 mt-4 space-y-4">
                      {/* Games and FPS Badges */}
                      {Array.isArray(build.fpsEstimates) && build.fpsEstimates.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                            // ESTIMATED_GAMING_PERFORMANCE_METRICS
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {build.fpsEstimates.map((est, idx) => {
                              const badge1080 = calculateFpsBadge(est.fps1080p);
                              const badge1440 = calculateFpsBadge(est.fps1440p);
                              const badge4k = calculateFpsBadge(est.fps4k);
                              return (
                                <div key={idx} className="bg-bg-main border border-border-muted p-3 space-y-2">
                                  <div className="text-xs font-bold text-text-accent tracking-wide">{est.game}</div>
                                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                                    <div className={`p-1 border ${badge1080.color}`}>1080p: {badge1080.label}</div>
                                    <div className={`p-1 border ${badge1440.color}`}>1440p: {badge1440.label}</div>
                                    <div className={`p-1 border ${badge4k.color}`}>4K: {badge4k.label}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* AI Rationale */}
                      {build.reason && (
                        <div className="space-y-1 bg-bg-main border border-border-muted p-3.5">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-text-primary">
                            // AI_SYSTEM_RATIONALE
                          </div>
                          <p className="text-xs text-text-secondary font-mono whitespace-pre-line leading-relaxed">
                            {build.reason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Build Card Bottom Toolbar */}
                <div className="px-6 py-3 bg-bg-main/70 border-t border-border-muted flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopyManifest(build)}
                      className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 border transition-colors cursor-pointer ${isCopied
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
                        : 'border-border-muted text-text-secondary hover:text-text-accent hover:border-text-primary'
                        }`}
                    >
                      {isCopied ? 'Manifest Copied!' : 'Copy Text Manifest'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {isDeleting ? (
                      <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/50 px-3 py-1">
                        <span className="text-[11px] text-red-300 font-mono">Confirm deletion?</span>
                        <button
                          onClick={() => handleDelete(build.id)}
                          className="bg-red-600 text-white px-2 py-0.5 text-xs font-bold uppercase cursor-pointer"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-text-secondary hover:text-text-accent px-1.5 text-xs font-mono uppercase cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(build.id)}
                        className="text-text-secondary hover:text-red-400 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer px-2 py-1"
                      >
                        [Delete Build]
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
