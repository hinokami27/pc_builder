import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

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

  // Fetch estimated wattage for current build configuration with debounce & deduplication
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

    // Debounce to batch rapid consecutive renders/mounts
    const timer = setTimeout(async () => {
      lastFetchedDtoRef.current = dtoString;

      try {
        const response = await fetch(`http://localhost:8080/api/compatible/wattage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: dtoString,
          signal: controller.signal
        });

        if (response.ok) {
          const data = await response.json();
          const val = typeof data === 'object' && data !== null ? (data.wattage ?? data.value ?? Object.values(data)[0]) : data;
          const parsedInt = typeof val === 'number' ? val : parseInt(val, 10);
          setEstimatedWattage(!isNaN(parsedInt) ? parsedInt : null);
        } else {
          setEstimatedWattage(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching compatible wattage:', err);
          setEstimatedWattage(null);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [currentBuild]);

  const fetchPartDetails = async (type, url) => {
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
      if (type === 'ram' || type === 'disk') {
        const urls = Array.isArray(val) ? val : (val ? [val] : []);
        const detailsList = await Promise.all(urls.map(url => fetchPartDetails(type, url)));
        newBuild[type] = detailsList.filter(Boolean);
      } else {
        const details = await fetchPartDetails(type, val);
        if (details) newBuild[type] = details;
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

        {/* Live Bill-of-Materials aggregate counter */}
        <div className="bg-bg-panel border border-border-muted p-4 min-w-50 text-right border-t-0">
          <div className="text-text-secondary text-xs uppercase tracking-wider font-bold">EST_ESTIMATED_TOTAL</div>
          <div className="text-2xl font-black text-text-accent mt-1">
            {totalCost.toLocaleString()} ден.
          </div>
        </div>
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