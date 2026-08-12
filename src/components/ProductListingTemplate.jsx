import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const pluralMap = {
  cpu: 'cpus',
  cooler: 'coolers',
  motherboard: 'motherboards',
  gpu: 'gpus',
  ram: 'rams',
  disk: 'disks',
  case: 'cases',
  psu: 'psus'
};

// Extract a comparable value from a product for a given filter key
function getFieldValue(product, key) {
  const raw = product[key];
  if (raw === null || raw === undefined || raw === '') return null;
  return String(raw).trim();
}

// For fields that may be comma-separated lists (e.g. cooler sockets)
function getFieldValues(product, key) {
  const raw = product[key];
  if (raw === null || raw === undefined || raw === '') return [];
  const str = String(raw).trim();
  // If it looks like a comma/slash-separated list, split it
  if (str.includes(',')) {
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [str];
}

// Chevron icon for collapsible sections
function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// X icon for active filter chips
function XIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// A single collapsible filter group
function FilterGroup({ label, filterKey, options, active, onToggle }) {
  const [open, setOpen] = useState(true);

  if (options.length === 0) return null;

  return (
    <div className="border-b border-border-muted last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-xs font-black tracking-[0.2em] uppercase text-text-accent">
          {label}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-1.5 max-h-64 overflow-y-auto">
          {options.map(opt => {
            const checked = active.includes(opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  onClick={() => onToggle(filterKey, opt)}
                  className={`
                    w-4 h-4 border shrink-0 flex items-center justify-center transition-all cursor-pointer
                    ${checked
                      ? 'bg-text-accent border-text-accent'
                      : 'border-border-muted bg-transparent group-hover:border-text-accent'
                    }
                  `}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-bg-main" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => onToggle(filterKey, opt)}
                  className={`text-[13px] font-mono tracking-wider uppercase truncate transition-colors cursor-pointer ${
                    checked ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                  }`}
                >
                  {opt}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductListingTemplate({ endpoint, title, renderSpecs, filters = [] }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Compatibility filter: ON by default
  const [compatibleOnly, setCompatibleOnly] = useState(true);
  // Did the user come from the configurator? (clean URL, no query params)
  const fromConfigurator = location.state?.fromConfigurator === true;

  // Active filters: { [filterKey]: string[] }
  const [activeFilters, setActiveFilters] = useState({});
  // Sort: 'none' | 'asc' | 'desc'
  const [sortPrice, setSortPrice] = useState('none');
  // Sidebar open on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);



  // Add a built-in Vendor filter for all product types
  const allFilters = useMemo(() => {
    return [{ key: 'storeName', label: 'Vendor' }, ...filters];
  }, [filters]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      // Reset filters whenever the data source changes
      setActiveFilters({});
      setSortPrice('none');
      try {
        let response;
        if (compatibleOnly) {
          const saved = JSON.parse(localStorage.getItem('pcBuilderConfig') || '{}');
          const dto = {
            cpuUrl: saved.cpu || null,
            coolerUrl: saved.cooler || null,
            motherboardUrl: saved.motherboard || null,
            gpuUrl: saved.gpu || null,
            ramUrls: Array.isArray(saved.ram) ? saved.ram : (saved.ram ? [saved.ram] : []),
            storageUrls: Array.isArray(saved.disk) ? saved.disk : (saved.disk ? [saved.disk] : []),
            caseUrl: saved.case || null,
            psuUrl: saved.psu || null
          };
          const targetComponent = pluralMap[endpoint] || `${endpoint}s`;
          response = await fetch(`http://localhost:8080/api/compatible/${targetComponent}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
          });
        } else {
          response = await fetch(`http://localhost:8080/api/${endpoint}/all`);
        }

        if (!response.ok) {
          const errorDetail = await response.text();
          throw new Error(`Failed to load ${endpoint}: ${response.statusText} - ${errorDetail}`);
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [endpoint, compatibleOnly]);

  // ── Derive filter options from data ───────────────────────────────────────
  const filterOptions = useMemo(() => {
    const result = {};
    allFilters.forEach(({ key }) => {
      const valSet = new Set();
      products.forEach(p => {
        // Multi-value fields (e.g. cooler sockets)
        const vals = getFieldValues(p, key);
        vals.forEach(v => { if (v) valSet.add(v); });
      });
      result[key] = Array.from(valSet).sort((a, b) => {
        // Numeric-aware sort
        const nA = parseFloat(a), nB = parseFloat(b);
        if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
        return a.localeCompare(b);
      });
    });
    return result;
  }, [products, allFilters]);

  // ── Toggle a filter checkbox ───────────────────────────────────────────────
  const toggleFilter = (key, value) => {
    setActiveFilters(prev => {
      const current = prev[key] || [];
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const removeFilter = (key, value) => {
    setActiveFilters(prev => {
      const next = (prev[key] || []).filter(v => v !== value);
      return { ...prev, [key]: next };
    });
  };

  const clearAll = () => {
    setActiveFilters({});
    setSortPrice('none');
  };

  // ── Apply filters then sort ────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let result = products;

    // Apply each active filter group (AND between groups, OR within a group)
    allFilters.forEach(({ key }) => {
      const selected = activeFilters[key];
      if (!selected || selected.length === 0) return;
      result = result.filter(p => {
        const vals = getFieldValues(p, key);
        return selected.some(sel => vals.includes(sel));
      });
    });

    // Sort by price
    if (sortPrice === 'asc') {
      result = [...result].sort((a, b) => (a.priceMkd || 0) - (b.priceMkd || 0));
    } else if (sortPrice === 'desc') {
      result = [...result].sort((a, b) => (b.priceMkd || 0) - (a.priceMkd || 0));
    }

    return result;
  }, [products, activeFilters, sortPrice, allFilters]);

  // Count active filter chips
  const activeChips = useMemo(() => {
    const chips = [];
    Object.entries(activeFilters).forEach(([key, vals]) => {
      vals.forEach(v => {
        const filterDef = allFilters.find(f => f.key === key);
        chips.push({ key, value: v, label: filterDef?.label || key });
      });
    });
    return chips;
  }, [activeFilters, allFilters]);

  const hasActiveFilters = activeChips.length > 0 || sortPrice !== 'none';

  // ── Toggle compatible-only filter ────────────────────────────────────────
  const handleToggleCompatible = () => {
    setCompatibleOnly(prev => !prev);
  };

  // ── Category navigation boxes ─────────────────────────────────────────────
  const CATEGORIES = [
    { id: 'cpu', label: 'PROCESSORS', path: '/products/cpu' },
    { id: 'cooler', label: 'COOLERS', path: '/products/cooler' },
    { id: 'motherboard', label: 'MOTHERBOARDS', path: '/products/motherboard' },
    { id: 'gpu', label: 'GRAPHICS CARDS', path: '/products/gpu' },
    { id: 'ram', label: 'MEMORY', path: '/products/ram' },
    { id: 'psu', label: 'POWER SUPPLIES', path: '/products/psu' },
    { id: 'disk', label: 'STORAGE', path: '/products/disk' },
    { id: 'case', label: 'CASES', path: '/products/case' },
  ];

  // Extract passed wattage from router state or fetch as fallback for PSU page
  const estimatedWattageFromState = location.state?.estimatedWattage;
  const [fetchedWattage, setFetchedWattage] = useState(null);

  useEffect(() => {
    if (endpoint !== 'psu') return;
    if (estimatedWattageFromState !== undefined && estimatedWattageFromState !== null) return;

    let isMounted = true;
    const fetchWattage = async () => {
      const saved = JSON.parse(localStorage.getItem('pcBuilderConfig') || '{}');
      const dto = {
        cpuUrl: saved.cpu || null,
        coolerUrl: saved.cooler || null,
        motherboardUrl: saved.motherboard || null,
        gpuUrl: saved.gpu || null,
        ramUrls: Array.isArray(saved.ram) ? saved.ram : (saved.ram ? [saved.ram] : []),
        storageUrls: Array.isArray(saved.disk) ? saved.disk : (saved.disk ? [saved.disk] : []),
        caseUrl: saved.case || null,
        psuUrl: saved.psu || null
      };

      try {
        const response = await fetch(`http://localhost:8080/api/compatible/wattage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto)
        });

        if (response.ok) {
          const data = await response.json();
          const val = typeof data === 'object' && data !== null ? (data.wattage ?? data.value ?? Object.values(data)[0]) : data;
          const parsedInt = typeof val === 'number' ? val : parseInt(val, 10);
          if (isMounted) {
            setFetchedWattage(!isNaN(parsedInt) ? parsedInt : null);
          }
        }
      } catch (err) {
        console.error('Error fetching wattage in PSU page:', err);
      }
    };

    fetchWattage();
    return () => {
      isMounted = false;
    };
  }, [endpoint, estimatedWattageFromState]);

  const displayWattage = estimatedWattageFromState ?? fetchedWattage;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="py-12 font-chakra space-y-6">

      {/* Category Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === endpoint;
          return (
            <Link
              key={cat.id}
              to={cat.path}
              className={`
                group bg-bg-panel border px-3 py-3 sm:py-4 transition-all
                flex flex-col items-center text-center gap-2
                ${isActive
                  ? 'border-text-accent bg-text-accent/5'
                  : 'border-border-muted hover:border-border-focus hover:-translate-y-0.5'
                }
              `}
            >
              <div className={`h-8 w-8 sm:h-10 sm:w-10 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`}>
                <img
                  src={`/src/assets/${cat.id}.png`}
                  alt={cat.label}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className={`text-[9px] sm:text-[10px] font-black tracking-widest uppercase leading-tight ${
                isActive ? 'text-text-accent' : 'text-text-primary'
              }`}>
                {cat.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Compatible Parts Banner */}
      <div className={`border px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        compatibleOnly
          ? 'border-text-accent bg-text-accent/10'
          : 'border-border-muted bg-bg-panel'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${
            compatibleOnly ? 'bg-text-accent animate-pulse' : 'bg-text-secondary'
          }`} />
          <div>
            <p className={`text-xs font-black tracking-widest uppercase ${
              compatibleOnly ? 'text-text-accent' : 'text-text-primary'
            }`}>
              {compatibleOnly ? 'Compatible Parts Only' : 'All Parts'}
            </p>
            <p className="text-text-secondary text-[13px] mt-0.5 font-mono">
              {compatibleOnly
                ? '// Showing parts compatible with your current build configuration'
                : `// Browse the full catalog of ${title.toLowerCase()}`}
            </p>
          </div>
        </div>

        {/* Radio toggle */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Compatible Only */}
          <label
            className="flex items-center gap-2 cursor-pointer"
            onClick={compatibleOnly ? undefined : handleToggleCompatible}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              compatibleOnly
                ? 'border-text-accent'
                : 'border-border-muted group-hover:border-text-accent'
            }`}>
              {compatibleOnly && <div className="w-2 h-2 rounded-full bg-text-accent" />}
            </div>
            <span className={`text-[13px] font-black tracking-widest uppercase transition-colors ${
              compatibleOnly ? 'text-text-accent' : 'text-text-secondary group-hover:text-text-accent'
            }`}>
              Compatible Only
            </span>
          </label>
          {/* All Parts */}
          <label
            className="flex items-center gap-2 cursor-pointer group"
            onClick={compatibleOnly ? handleToggleCompatible : undefined}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              compatibleOnly
                ? 'border-border-muted group-hover:border-text-primary'
                : 'border-text-primary'
            }`}>
              {!compatibleOnly && <div className="w-2 h-2 rounded-full bg-text-primary" />}
            </div>
            <span className={`text-[13px] font-black tracking-widest uppercase transition-colors ${
              compatibleOnly
                ? 'text-text-secondary group-hover:text-text-primary'
                : 'text-text-primary'
            }`}>
              {compatibleOnly ? 'Show All' : 'All Parts'}
            </span>
          </label>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-muted pb-6 gap-4">
        <div>
          <Link
            to={fromConfigurator ? '/configurator' : '/products'}
            className="text-text-accent text-xs uppercase tracking-widest underline underline-offset-2 hover:text-text-primary transition-colors mb-2 block"
          >
            &lt; {fromConfigurator ? 'Back to Configurator' : 'Back to Categories'}
          </Link>
          <h1 className="text-3xl font-black text-text-primary tracking-widest uppercase">
            {title}_Index
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Result count */}
          <div className="text-text-secondary text-xs font-mono">
            RESULTS: <span className="text-text-primary font-black">{displayed.length}</span>
            {displayed.length !== products.length && (
              <span className="text-text-accent"> / {products.length}</span>
            )}
          </div>

          {/* Mobile filter toggle */}
          {allFilters.length > 0 && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="md:hidden text-xs font-black tracking-widest uppercase border border-border-muted px-3 py-1.5 hover:border-text-accent hover:text-text-accent transition-colors"
            >
              {sidebarOpen ? 'Hide Filters' : 'Filters'}
              {activeChips.length > 0 && (
                <span className="ml-1.5 bg-text-accent text-bg-main px-1 rounded-sm">
                  {activeChips.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Estimated Wattage Box for PSU Listing Page (Right under header's bottom border) */}
      {endpoint === 'psu' && (
        <div className="flex justify-end -mt-6">
          <div className="bg-bg-panel border border-border-muted p-4 min-w-50 text-right border-t-0">
            <div className="text-text-secondary text-xs uppercase tracking-wider font-bold">EST_ESTIMATED_WATTAGE</div>
            <div className="text-2xl font-black text-text-accent mt-1 font-mono">
              {displayWattage !== null && displayWattage !== undefined ? `${displayWattage} W` : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Sort + Active Chips bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-widest uppercase text-text-secondary">Sort:</span>
          <select
            value={sortPrice}
            onChange={e => setSortPrice(e.target.value)}
            className="bg-bg-panel border border-border-muted text-text-primary text-[13px] font-mono uppercase tracking-wider px-2 py-1.5 cursor-pointer hover:border-text-accent transition-colors focus:outline-none focus:border-text-accent appearance-none pr-6"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
          >
            <option value="none">Price: Default</option>
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>
        </div>

        {/* Active filter chips */}
        {activeChips.map(({ key, value, label }) => (
          <button
            key={`${key}-${value}`}
            onClick={() => removeFilter(key, value)}
            className="flex items-center gap-1.5 bg-text-accent/15 border border-text-accent/40 text-text-accent text-xs font-black tracking-widest uppercase px-2.5 py-1 hover:bg-text-accent/25 transition-colors"
          >
            <span className="text-text-secondary font-mono">{label}:</span>
            {value}
            <XIcon />
          </button>
        ))}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-black tracking-widest uppercase text-text-secondary hover:text-text-accent transition-colors underline underline-offset-2"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Main layout: sidebar + grid */}
      <div className="flex gap-6 items-start">

        {/* Filter Sidebar */}
        {allFilters.length > 0 && (
          <aside
            className={`
              shrink-0 w-56 bg-bg-panel border border-border-muted overflow-hidden
              ${sidebarOpen ? 'block' : 'hidden'} md:block
            `}
          >
            <div className="px-4 py-3 border-b border-border-muted flex items-center justify-between">
              <span className="text-xs font-black tracking-[0.25em] uppercase text-text-secondary">
                // Filters
              </span>
              {activeChips.length > 0 && (
                <button
                  onClick={() => setActiveFilters({})}
                  className="text-[11px] font-black tracking-widest uppercase text-text-accent hover:text-text-primary transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {allFilters.map(({ key, label }) => (
              <FilterGroup
                key={key}
                label={label}
                filterKey={key}
                options={filterOptions[key] || []}
                active={activeFilters[key] || []}
                onToggle={toggleFilter}
              />
            ))}
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full bg-bg-panel border border-border-muted border-dashed p-20 text-center text-text-secondary uppercase tracking-widest text-sm">
                // Synchronizing with global repository...
              </div>
            ) : error ? (
              <div className="col-span-full bg-bg-panel border border-text-accent p-20 text-center text-text-accent uppercase tracking-widest text-sm">
                // ERROR_CRITICAL: {error}
              </div>
            ) : displayed.length > 0 ? displayed.map((product) => (
              <div
                key={product.id}
                className="bg-bg-panel border border-border-muted flex flex-col hover:border-border-focus transition-colors group h-full"
              >
                {/* Visual Block */}
                <div className="bg-bg-main aspect-square p-6 border-b border-border-muted flex items-center justify-center relative overflow-hidden">
                  <img
                    src={product.imgUrl}
                    alt={product.modelName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://placehold.co/200x200/0d0d13/38bdf8?text=PART'; }}
                  />
                </div>

                {/* Content Block */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1 space-y-3">
                    <Link
                      to={`/product/details?type=${endpoint}&url=${encodeURIComponent(product.storeUrl)}`}
                      className="text-text-primary text-base font-black hover:text-text-accent transition-colors block leading-tight tracking-wide uppercase italic line-clamp-2 min-h-[2.5em]"
                    >
                      {product.modelName}
                    </Link>

                    <div className="flex flex-col gap-1 text-sm text-text-secondary uppercase tracking-widest font-mono border-t border-border-muted/30 pt-3">
                      {renderSpecs(product)}
                      <div className="pt-1 opacity-100">
                        VENDOR: <span className="text-text-primary font-bold">{product.storeName || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 border-t border-border-muted pt-4">
                    <div className="text-left">
                      <div className="text-text-accent font-black text-lg">{product.priceMkd?.toLocaleString() || 0} ден.</div>
                    </div>

                    <Link
                      to={`/configurator?type=${endpoint}&url=${encodeURIComponent(product.storeUrl)}`}
                      className="bg-text-primary text-bg-main px-3 py-1.5 text-xs font-black tracking-widest uppercase shadow-[0_3px_0_0_rgb(73,12,133)] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                    >
                      Select
                    </Link>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full bg-bg-panel border border-border-muted border-dashed p-20 text-center text-text-secondary uppercase tracking-widest text-sm">
                {hasActiveFilters
                  ? '// No modules match the active filter parameters. Try adjusting filters.'
                  : '// No data modules found for this category index.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
