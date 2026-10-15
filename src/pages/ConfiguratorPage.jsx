import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import SaveBuildModal from '../components/SaveBuildModal';
import { saveBuild } from '../utils/inventoryStorage';

// 1. Define the official hardware rows manifest array
const COMPONENT_SLOTS = [
  { id: 'cpu', label: 'CPU' },
  { id: 'cooler', label: 'COOLER' },
  { id: 'motherboard', label: 'MOTHER' + '\n' + 'BOARD' },
  { id: 'gpu', label: 'GRAPHICS' + '\n' + 'CARD' },
  { id: 'ram', label: 'MEMORY' },
  { id: 'disk', label: 'STORAGE' },
  { id: 'case', label: 'CASE' },
  { id: 'psu', label: 'POWER SUPPLY' }
];

const LOCAL_STORAGE_KEY = 'pcBuilderConfig';

export default function ConfiguratorPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const processedParamsRef = useRef(null);
  const lastFetchedDtoRef = useRef(null);
  const activeAbortControllerRef = useRef(null);

  const [estimatedWattage, setEstimatedWattage] = useState(null);
  const [compatibilityWarnings, setCompatibilityWarnings] = useState([]);
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(false);

  const [currentBuild, setCurrentBuild] = useState({
    cpu: null,
    cooler: null,
    motherboard: null,
    gpu: null,
    ram: [],
    disk: [],
    case: null,
    psu: null
  });

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveWarning, setSaveWarning] = useState(null);

  // Fetch estimated wattage & compatibility check for current build configuration with debounce & deduplication
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
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

    const dtoString = JSON.stringify(dto);

    // Skip if we already fetched or are fetching this exact DTO
    if (lastFetchedDtoRef.current === dtoString) {
      return;
    }

    // Cancel any active in-flight request
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    setIsCheckingCompatibility(true);

    // Debounce to batch rapid consecutive renders/mounts
    const timer = setTimeout(async () => {
      lastFetchedDtoRef.current = dtoString;

      try {
        const [wattageRes, checkRes] = await Promise.all([
          fetch(`http://localhost:8080/api/compatible/wattage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: dtoString,
            signal: controller.signal
          }),
          fetch(`http://localhost:8080/api/compatible/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: dtoString,
            signal: controller.signal
          })
        ]);

        if (wattageRes.ok) {
          const data = await wattageRes.json();
          const val = typeof data === 'object' && data !== null ? (data.wattage ?? data.value ?? Object.values(data)[0]) : data;
          const parsedInt = typeof val === 'number' ? val : parseInt(val, 10);
          setEstimatedWattage(!isNaN(parsedInt) ? parsedInt : null);
        } else {
          setEstimatedWattage(null);
        }

        if (checkRes.ok) {
          const data = await checkRes.json();
          const warningsList = Array.isArray(data) ? data : (Array.isArray(data?.warnings) ? data.warnings : []);
          setCompatibilityWarnings(warningsList);
        } else {
          setCompatibilityWarnings([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching compatibility diagnostics:', err);
          setEstimatedWattage(null);
          setCompatibilityWarnings([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingCompatibility(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [currentBuild]);

  const fetchPartDetails = async (type, url) => {
    if (!url || typeof url !== 'string' || url === 'null' || url === 'undefined') return null;
    try {
      const response = await fetch(`http://localhost:8080/api/${type}/find?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return {
          ...data,
          name: data.modelName,
          price: data.priceMkd,
          imageUrl: data.imgUrl
        };
      }
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
    }
    return null;
  };

  const loadBuild = useCallback(async () => {
    const savedConfig = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    const newBuild = {
      cpu: null, cooler: null, motherboard: null, gpu: null,
      ram: [], disk: [], case: null, psu: null
    };

    const loadPromises = Object.entries(savedConfig).map(async ([type, val]) => {
      if (!val) return;
      if (type === 'ram' || type === 'disk') {
        const urls = Array.isArray(val) ? val : (val ? [val] : []);
        const validUrls = urls.filter(u => u && typeof u === 'string' && u !== 'null' && u !== 'undefined');
        const detailsList = await Promise.all(validUrls.map(url => fetchPartDetails(type, url)));
        newBuild[type] = detailsList.filter(Boolean);
      } else {
        if (typeof val === 'string' && val !== 'null' && val !== 'undefined') {
          const details = await fetchPartDetails(type, val);
          if (details) newBuild[type] = details;
        }
      }
    });

    await Promise.all(loadPromises);
    setCurrentBuild(newBuild);
  }, []);

  useEffect(() => {
    const type = searchParams.get('type');
    const url = searchParams.get('url');
    const paramKey = `${type}-${url}`;

    if (type && url) {
      if (processedParamsRef.current === paramKey) {
        return;
      }
      processedParamsRef.current = paramKey;

      const savedConfig = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
      if (type === 'ram' || type === 'disk') {
        const existing = savedConfig[type];
        const arr = Array.isArray(existing) ? existing : (existing ? [existing] : []);
        arr.push(url);
        savedConfig[type] = arr;
      } else {
        savedConfig[type] = url;
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedConfig));
      setSearchParams({}, { replace: true });
    } else {
      processedParamsRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadBuild();
    }
  }, [searchParams, setSearchParams, loadBuild]);

  const handleRemove = (id, index) => {
    lastFetchedDtoRef.current = null;
    const savedConfig = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    if (id === 'ram' || id === 'disk') {
      const existing = savedConfig[id];
      const arr = Array.isArray(existing) ? existing : (existing ? [existing] : []);
      if (index !== undefined && index >= 0 && index < arr.length) {
        arr.splice(index, 1);
      }
      savedConfig[id] = arr;
    } else {
      delete savedConfig[id];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedConfig));
    loadBuild();
  };

  // Calculate totals tracking
  const totalCost = Object.entries(currentBuild).reduce((sum, [type, val]) => {
    if (type === 'ram' || type === 'disk') {
      const arr = Array.isArray(val) ? val : [];
      return sum + arr.reduce((subSum, part) => subSum + (part ? part.price : 0), 0);
    }
    return sum + (val ? val.price : 0);
  }, 0);

  const totalPartsCount = Object.values(currentBuild).reduce((acc, val) => {
    if (Array.isArray(val)) return acc + val.length;
    return acc + (val ? 1 : 0);
  }, 0);

  const handleSaveBuildClick = () => {
    if (totalPartsCount === 0) {
      setSaveWarning('// ERROR: CANNOT ARCHIVE EMPTY SYSTEM. ALLOCATE COMPONENTS FIRST.');
      setTimeout(() => setSaveWarning(null), 3500);
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleSaveConfirm = (buildName) => {
    const savedConfig = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    saveBuild({
      name: buildName,
      config: savedConfig,
      partsSnapshot: currentBuild,
      totalPrice: totalCost,
      estimatedWattage,
      source: 'Configurator'
    });
  };

  return (
    <div className="space-y-8 mb-12 font-chakra">

      {/* Configuration Header Diagnostics Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border-muted pb-6 gap-4">
        <div className='pt-8'>
          <h1 className="font-display text-3xl font-black text-text-accent tracking-widest uppercase">
            System_Configurator
          </h1>
          <p className="text-text-secondary text-xs mt-1">
            // STATUS: ASSEMBLING MATRIX MANIFEST
          </p>
        </div>

        {/* Live Bill-of-Materials aggregate counter & Save Build Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-bg-panel border border-border-muted p-4 min-w-50 text-right">
            <div className="text-text-secondary text-xs uppercase tracking-wider font-bold">EST_ESTIMATED_TOTAL</div>
            <div className="text-2xl font-black text-text-accent mt-1">
              {totalCost.toLocaleString()} ден.
            </div>
          </div>

          <button
            onClick={handleSaveBuildClick}
            className="bg-text-primary text-bg-main px-5 py-4 text-xs font-black tracking-widest uppercase transition-all duration-75 border border-transparent shadow-[0_4px_0_0_rgb(73,12,133)] hover:bg-text-dulled hover:text-white active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Save Build</span>
          </button>
        </div>
      </div>

      {/* Save Warning Notification */}
      {saveWarning && (
        <div className="bg-amber-950/40 border border-amber-500/50 p-3 text-amber-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <span>{saveWarning}</span>
        </div>
      )}

      {/* Save Build Modal */}
      <SaveBuildModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        defaultName={`Custom Rig ${new Date().toLocaleDateString()}`}
        totalPrice={totalCost}
        partsCount={totalPartsCount}
        estimatedWattage={estimatedWattage}
        source="Configurator"
        onSave={handleSaveConfirm}
      />

      {/* Compatibility Diagnostics Panel */}
      <div className="bg-bg-panel border border-border-muted p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border-muted pb-3">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${
              isCheckingCompatibility
                ? 'bg-amber-400 animate-ping'
                : compatibilityWarnings.length > 0
                ? 'bg-red-500 animate-pulse'
                : totalPartsCount > 0
                ? 'bg-emerald-400'
                : 'bg-text-secondary'
            }`} />
            <h2 className="text-sm font-bold tracking-wider uppercase text-text-accent font-display">
              // COMPATIBILITY_DIAGNOSTICS_MATRIX
            </h2>
          </div>
          {isCheckingCompatibility && (
            <span className="text-xs text-amber-400 font-mono animate-pulse">
              [ EVALUATING COMPATIBILITY... ]
            </span>
          )}
        </div>

        {compatibilityWarnings.length > 0 ? (
          <div className="bg-red-950/30 border border-red-500/40 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>System Incompatibilities Detected ({compatibilityWarnings.length})</span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-red-200 text-xs font-mono">
              {compatibilityWarnings.map((warning, idx) => (
                <li key={idx} className="leading-relaxed">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        ) : totalPartsCount > 0 ? (
          <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 flex items-center gap-3">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-emerald-300 text-xs font-mono tracking-wide">
              All selected components are compatible. No hardware conflicts detected.
            </span>
          </div>
        ) : (
          <div className="text-text-secondary text-xs font-mono p-2">
            // No components allocated yet. Select parts to begin live compatibility check.
          </div>
        )}
      </div>

      {/* Main Structural Layout Rows Container */}
      <div className="space-y-4">
        {COMPONENT_SLOTS.map((slot) => {
          const isMultiple = slot.id === 'ram' || slot.id === 'disk';
          const selectedParts = isMultiple
            ? (currentBuild[slot.id] || [])
            : (currentBuild[slot.id] ? [currentBuild[slot.id]] : []);

          return (
            <div
              key={slot.id}
              className="flex flex-col md:flex-row md:items-stretch bg-bg-panel border border-border-muted transition-colors hover:border-border-focus min-h-30"
            >

              {/* Category Core Indicator Key */}
              <div className="w-full md:w-32 bg-bg-main border-b md:border-b-0 md:border-r border-border-muted px-4 py-6 md:py-8 flex flex-col items-center justify-center gap-3 shrink-0 text-center">
                <div className="flex flex-col gap-1 items-center justify-center w-full">
                  <span className="text-text-accent font-bold text-base tracking-widest uppercase leading-tight whitespace-pre-line">
                    {slot.label}
                  </span>
                  {selectedParts.length === 0 && (
                    <span className="text-text-secondary text-[10px] font-mono">// UNALLOCATED</span>
                  )}
                </div>

                {isMultiple && selectedParts.length > 0 && (
                  <button
                    onClick={() => navigate(`/products/${slot.id}`, { state: { fromConfigurator: true, estimatedWattage: slot.id === 'psu' ? estimatedWattage : undefined } })}
                    className="text-[10px] font-black tracking-widest text-text-primary hover:text-text-accent uppercase border border-border-muted hover:border-text-primary px-2 py-1.5 transition-all cursor-pointer select-none"
                  >
                    + ADD MORE
                  </button>
                )}
              </div>

              {/* Dynamic Slot Renderer Area */}
              <div className="flex-1 p-4 flex flex-col justify-center">
                {selectedParts.length > 0 ? (
                  <div className="space-y-4">
                    {selectedParts.map((part, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${idx > 0 ? 'border-t border-border-muted/30 pt-4' : ''}`}
                      >
                        {/* Part Identity Profile (Image, Text, Link) */}
                        <div className="flex items-center gap-4">
                          <img
                            src={part.imageUrl}
                            alt={part.name}
                            referrerPolicy="no-referrer"
                            className="w-24 h-24 object-contain border border-border-muted p-2 bg-bg-main shrink-0"
                          />
                          <div className="space-y-1">
                            <Link
                              to={`/product/details?type=${slot.id}&url=${encodeURIComponent(part.storeUrl)}`}
                              className="text-text-primary text-lg font-bold hover:text-text-accent transition-colors block leading-tight tracking-wide"
                            >
                              {part.name}
                            </Link>
                            {slot.id === 'cpu' && (
                              <div className="text-xs text-text-secondary uppercase tracking-wider">
                                CORES/THREADS: <span className="text-text-primary font-bold">{part.cores || 'N/A'}/{part.threads || 'N/A'}</span>
                              </div>
                            )}
                            {slot.id === 'cooler' && (
                              <div className="text-xs text-text-secondary uppercase tracking-wider">
                                TYPE: <span className="text-text-primary font-bold">{part.coolerType || 'N/A'}</span>
                              </div>
                            )}
                            {slot.id === 'motherboard' && (
                              <div className="text-xs text-text-secondary uppercase tracking-wider">
                                SOCKET: <span className="text-text-primary font-bold">{part.socket || 'N/A'}</span> | CHIPSET: <span className="text-text-primary font-bold">{part.chipset || 'N/A'}</span>
                              </div>
                            )}
                            {slot.id === 'gpu' && (
                              <div className="text-xs text-text-secondary uppercase tracking-wider">
                                VRAM: <span className="text-text-primary font-bold">{part.vram || 'N/A'}</span>
                              </div>
                            )}
                            {slot.id === 'ram' && (
                              <div className="text-xs text-text-secondary uppercase tracking-wider">
                                CAPACITY: <span className="text-text-primary font-bold">{part.ramSize || 'N/A'}</span> | SPEED: <span className="text-text-primary font-bold">{part.ramSpeed || 'N/A'}</span> | TYPE: <span className="text-text-primary font-bold">{part.ramType || 'N/A'}</span>
                              </div>
                            )}
                            {slot.id === 'psu' && (
                              <div className="text-xs text-text-secondary uppercase tracking-wider">
                                WATTAGE: <span className="text-text-primary font-bold">{part.wattage || 'N/A'}</span> | EFFICIENCY: <span className="text-text-primary font-bold">{part.efficiency || 'N/A'}</span>
                              </div>
                            )}
                            {slot.id === 'disk' && (
                              <div className="text-xs text-text-secondary uppercase tracking-wider">
                                TYPE: <span className="text-text-primary font-bold">{part.speed || 'N/A'} {part.diskType || 'N/A'}</span> | SIZE: <span className="text-text-primary font-bold">{part.size || 'N/A'}</span>
                              </div>
                            )}
                            {slot.id === 'case' && (
                              <div className="text-xs text-text-secondary uppercase tracking-wider">
                                FORM FACTOR: <span className="text-text-primary font-bold">{part.formFactor || 'N/A'}</span>
                              </div>
                            )}
                            <div className="text-xs text-text-secondary uppercase tracking-wider">
                              VENDOR: <span className="text-text-primary font-bold">{part.storeName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Matrix Breakdown & Actions */}
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-border-muted pt-3 sm:pt-0 pl-4">
                          <div className="text-right">
                            <div className="text-text-accent font-black text-xl tracking-wide">
                              {part.price.toLocaleString()} ден.
                            </div>
                            <div className="text-[10px] text-text-secondary">// REALTIME_FEED</div>
                          </div>

                          <button
                            onClick={() => handleRemove(slot.id, idx)}
                            className="text-text-secondary hover:text-text-accent text-xs font-bold uppercase tracking-widest p-2 border border-transparent hover:border-border-muted transition-all cursor-pointer"
                          >
                            [REMOVE]
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Seamless + ADD MORE is now located inside the category side panel */}
                  </div>
                ) : (

                  /* STATE B: SLOT VACANT (Prompt User to Choose) */
                  <div className="flex justify-between items-center py-2">
                    <div className="text-text-secondary text-xs tracking-wider">
                      No hardware profile currently allocated to this node.
                    </div>

                    {/* Bumpy 3D Action Button Custom Trigger */}
                    <button
                      onClick={() => navigate(`/products/${slot.id}`, { state: { fromConfigurator: true, estimatedWattage: slot.id === 'psu' ? estimatedWattage : undefined } })}
                      className="bg-text-primary text-bg-main px-4 py-2 text-xs font-black tracking-widest uppercase transition-all duration-75 border border-transparent shadow-[0_3px_0_0_rgb(73,12,133)] hover:bg-text-dulled hover:text-white active:translate-y-1 active:shadow-none cursor-pointer"
                    >
                      + Add Item
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}