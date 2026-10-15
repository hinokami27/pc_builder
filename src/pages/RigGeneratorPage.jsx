import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SaveBuildModal from '../components/SaveBuildModal';
import { saveBuild } from '../utils/inventoryStorage';

const POPULAR_GAMES = [
  { id: 'cyberpunk', name: 'Cyberpunk 2077', genre: 'Sci-Fi RPG / Ray Tracing', badge: 'High Spec' },
  { id: 'cs2', name: 'Counter-Strike 2', genre: 'Esports FPS', badge: 'Competitive' },
  { id: 'rdr2', name: 'Red Dead Redemption 2', genre: 'Open World Adventure', badge: 'High Spec' },
  { id: 'wukong', name: 'Black Myth: Wukong', genre: 'Action RPG / UE5', badge: 'Ultra Spec' },
  { id: 'gta5', name: 'Grand Theft Auto V', genre: 'Open World Action', badge: 'Popular' },
  { id: 'warzone', name: 'Call of Duty: Warzone', genre: 'Battle Royale FPS', badge: 'Fast Paced' },
  { id: 'fortnite', name: 'Fortnite', genre: 'Battle Royale / UE5', badge: 'Esports' },
  { id: 'valorant', name: 'Valorant', genre: 'Tactical Shooter', badge: 'High FPS' },
  { id: 'apex', name: 'Apex Legends', genre: 'Fast FPS / Battle Royale', badge: 'Competitive' },
  { id: 'eldenring', name: 'Elden Ring', genre: 'Action RPG / Soulslike', badge: 'Demanding' },
  { id: 'bg3', name: 'Baldur\'s Gate 3', genre: 'Turn-Based RPG', badge: 'CPU Heavy' },
  { id: 'helldivers2', name: 'Helldivers 2', genre: 'Co-op Shooter', badge: 'Intense' },
  { id: 'witcher3', name: 'The Witcher 3: Wild Hunt', genre: 'Open World RPG', badge: 'Benchmark' },
  { id: 'forza5', name: 'Forza Horizon 5', genre: 'Open World Racing', badge: 'GPU Heavy' },
  { id: 'hogwarts', name: 'Hogwarts Legacy', genre: 'Open World RPG', badge: 'High Spec' }
];

const COMPONENT_SLOTS = [
  { id: 'cpu', label: 'CPU', getPart: (b) => b?.cpu || b?.processor },
  { id: 'cooler', label: 'COOLER', getPart: (b) => b?.cooler || b?.cpuCooler || b?.cooling },
  { id: 'motherboard', label: 'MOTHER\nBOARD', getPart: (b) => b?.motherboard || b?.mobo || b?.mainboard },
  { id: 'gpu', label: 'GRAPHICS\nCARD', getPart: (b) => b?.gpu || b?.graphicsCard || b?.videoCard || b?.graphics_card },
  { id: 'ram', label: 'MEMORY', getPart: (b) => b?.rams || b?.ram || b?.ramList || b?.memory || b?.memories },
  { id: 'disk', label: 'STORAGE', getPart: (b) => b?.disks || b?.disk || b?.storage || b?.storages || b?.storageList || b?.ssd || b?.ssds || b?.hardDrive },
  { id: 'case', label: 'CASE', getPart: (b) => b?.kase || b?.case || b?.pcCase || b?.caseEntity || b?.chassis || b?.box },
  { id: 'psu', label: 'POWER SUPPLY', getPart: (b) => b?.psu || b?.powerSupply || b?.power_supply }
];

const BUDGET_PRESETS = [45000, 60000, 75000, 95000, 120000, 150000];

// Safe extraction of URL string from any object or primitive representation
const extractUrl = (item) => {
  if (!item) return null;
  if (typeof item === 'string') {
    let str = item.trim();
    if (!str || str === 'null' || str === 'undefined') return null;
    try { str = decodeURIComponent(str); } catch { /* noop */ }
    return str;
  }
  const raw = item.storeUrl || item.url || item.link || item.productUrl || item.webUrl || item.storeLink;
  if (typeof raw === 'string') {
    let str = raw.trim();
    if (!str || str === 'null' || str === 'undefined') return null;
    try { str = decodeURIComponent(str); } catch { /* noop */ }
    return str;
  }
  return null;
};

const extractUrlsArray = (items) => {
  if (!items) return [];
  if (Array.isArray(items)) {
    return items.map(extractUrl).filter(Boolean);
  }
  const single = extractUrl(items);
  return single ? [single] : [];
};

export default function RigGeneratorPage() {
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const [budget, setBudget] = useState(75000);
  const [selectedGames, setSelectedGames] = useState(['Cyberpunk 2077', 'Counter-Strike 2', 'Red Dead Redemption 2']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Focus and scroll smoothly down to the generated results whenever a result arrives
  useEffect(() => {
    if (result && resultsRef.current) {
      // Small timeout to allow DOM layout to render fully before scrolling
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  const toggleGame = (gameName) => {
    if (selectedGames.includes(gameName)) {
      setSelectedGames(selectedGames.filter((g) => g !== gameName));
    } else {
      if (selectedGames.length >= 3) {
        return; // Max 3 allowed
      }
      setSelectedGames([...selectedGames, gameName]);
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!budget || budget <= 0) {
      setError('Please provide a valid budget in MKD.');
      return;
    }
    if (selectedGames.length === 0) {
      setError('Please select at least 1 game (up to 3).');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    // Add 2% buffer onto the user input budget
    const adjustedBudget = Math.round(Number(budget) * 1.02);

    const payload = {
      budget: adjustedBudget,
      games: selectedGames
    };

    try {
      const response = await fetch('http://localhost:8080/api/ai-builds/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('AI Build Generation backend error:', response.status, errText);
        throw new Error('SERVER_ERROR');
      }

      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error('INVALID_DATA');
      }
      setResult(data);
    } catch (err) {
      console.error('Failed to generate AI build:', err);
      setError('Something unexpected happened while synthesizing the rig. Please try again or adjust your budget and game selection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to normalize a single part entity
  const normalizePart = (part) => {
    if (!part) return null;
    return {
      ...part,
      name: part.modelName || part.name || 'Component Item',
      price: part.priceMkd ?? part.price ?? 0,
      imageUrl: part.imgUrl || part.imageUrl || '',
      storeUrl: extractUrl(part) || '',
      storeName: part.storeName || 'Vendor'
    };
  };

  // Export generated build to user's Configurator LocalStorage with guaranteed key mapping
  const handleTransferToConfigurator = () => {
    if (!result?.pcBuild) return;
    const b = result.pcBuild;
    const config = {};

    const cpu = extractUrl(b.cpu || b.processor);
    if (cpu) config.cpu = cpu;

    const cooler = extractUrl(b.cooler || b.cpuCooler || b.cooling);
    if (cooler) config.cooler = cooler;

    const motherboard = extractUrl(b.motherboard || b.mobo || b.mainboard);
    if (motherboard) config.motherboard = motherboard;

    const gpu = extractUrl(b.gpu || b.graphicsCard || b.videoCard || b.graphics_card);
    if (gpu) config.gpu = gpu;

    const ram = extractUrlsArray(b.rams || b.ram || b.ramList || b.memory || b.memories);
    if (ram.length > 0) config.ram = ram;

    const disk = extractUrlsArray(b.disks || b.disk || b.storage || b.storages || b.storageList || b.ssd || b.ssds || b.hardDrive);
    if (disk.length > 0) config.disk = disk;

    const pcCase = extractUrl(b.kase || b.case || b.pcCase || b.caseEntity || b.chassis || b.box);
    if (pcCase) config.case = pcCase;

    const psu = extractUrl(b.psu || b.powerSupply || b.power_supply);
    if (psu) config.psu = psu;

    localStorage.setItem('pcBuilderConfig', JSON.stringify(config));
    navigate('/configurator');
  };

  const handleSaveAIBuild = (buildName) => {
    if (!result?.pcBuild) return;
    const b = result.pcBuild;
    const config = {};

    const cpu = extractUrl(b.cpu || b.processor);
    if (cpu) config.cpu = cpu;

    const cooler = extractUrl(b.cooler || b.cpuCooler || b.cooling);
    if (cooler) config.cooler = cooler;

    const motherboard = extractUrl(b.motherboard || b.mobo || b.mainboard);
    if (motherboard) config.motherboard = motherboard;

    const gpu = extractUrl(b.gpu || b.graphicsCard || b.videoCard || b.graphics_card);
    if (gpu) config.gpu = gpu;

    const ram = extractUrlsArray(b.rams || b.ram || b.ramList || b.memory || b.memories);
    if (ram.length > 0) config.ram = ram;

    const disk = extractUrlsArray(b.disks || b.disk || b.storage || b.storages || b.storageList || b.ssd || b.ssds || b.hardDrive);
    if (disk.length > 0) config.disk = disk;

    const pcCase = extractUrl(b.kase || b.case || b.pcCase || b.caseEntity || b.chassis || b.box);
    if (pcCase) config.case = pcCase;

    const psu = extractUrl(b.psu || b.powerSupply || b.power_supply);
    if (psu) config.psu = psu;

    // Snapshot of normalized components
    const partsSnapshot = {};
    COMPONENT_SLOTS.forEach((slot) => {
      const rawPart = slot.getPart(b);
      const isMultiple = slot.id === 'ram' || slot.id === 'disk';
      const partsArray = isMultiple
        ? (Array.isArray(rawPart) ? rawPart : (rawPart ? [rawPart] : []))
        : (rawPart ? [rawPart] : []);
      const normalized = partsArray.map(normalizePart).filter(Boolean);
      if (isMultiple) {
        partsSnapshot[slot.id] = normalized;
      } else {
        partsSnapshot[slot.id] = normalized[0] || null;
      }
    });

    saveBuild({
      name: buildName,
      config,
      partsSnapshot,
      totalPrice: result.totalPrice ?? result.price ?? 0,
      source: 'AI Rig Generator',
      games: selectedGames,
      fpsEstimates: result.fpsEstimates || [],
      reason: result.reason || ''
    });
  };

  const calculateFpsBadge = (fps) => {
    if (!fps && fps !== 0) return { label: 'N/A', color: 'text-text-secondary border-border-muted bg-bg-main' };
    if (fps >= 60) return { label: `${fps} FPS`, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' };
    if (fps >= 35) return { label: `${fps} FPS`, color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' };
    return { label: `${fps} FPS`, color: 'text-red-400 border-red-500/40 bg-red-950/30' };
  };

  return (
    <div className="space-y-10 mb-16 font-chakra">

      {/* Header Banner */}
      <div className="border-b border-border-muted pb-6 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="text-xs text-text-primary tracking-widest uppercase font-mono mb-1">
              // NEURAL_SYSTEM_SYNTHESIS
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-black text-text-accent tracking-widest uppercase">
              AI_Rig_Generator
            </h1>
            <p className="text-text-secondary text-xs md:text-sm mt-2 max-w-2xl leading-relaxed">
              Define your budget ceiling in Macedonian Denars (MKD) and select your target gaming titles.
              Our neural engine will curate an optimal, fully compatible build balanced for maximum performance.
            </p>
          </div>

          <div className="bg-bg-panel border border-border-muted p-3 px-5 text-right shrink-0">
            <div className="text-[10px] text-text-secondary uppercase tracking-widest font-mono">
              TARGET ENGINE
            </div>
            <div className="text-sm font-bold text-text-accent tracking-wider">
              HEURISTIC_PARTS_v2
            </div>
          </div>
        </div>
      </div>

      {/* Generator Configuration Form */}
      <form onSubmit={handleGenerate} className="bg-bg-panel border border-border-muted p-6 md:p-8 space-y-8">

        {/* Section 1: Budget Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-border-muted/60 pb-2">
            <label htmlFor="budget-input" className="text-sm font-bold tracking-widest text-text-accent uppercase flex items-center gap-2">
              <span className="text-text-primary font-mono">[01]</span>
              Total Budget (MKD / МКД)
            </label>
            <span className="text-xs text-text-secondary font-mono">
              CURRENT: <span className="text-text-primary font-bold">{Number(budget || 0).toLocaleString()} ден.</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="relative md:col-span-1">
              <input
                id="budget-input"
                type="number"
                min="10000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 75000"
                className="w-full bg-bg-main border border-border-muted focus:border-text-primary px-4 py-3 text-lg font-bold text-text-accent placeholder-text-secondary/40 outline-none transition-all font-mono"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary pointer-events-none">
                МКД
              </span>
            </div>

            {/* Quick Presets */}
            <div className="md:col-span-2 flex flex-wrap gap-2">
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBudget(preset)}
                  className={`text-xs px-3 py-2 font-mono border transition-all cursor-pointer ${Number(budget) === preset
                    ? 'border-text-primary bg-text-primary/10 text-text-primary font-bold'
                    : 'border-border-muted text-text-secondary hover:border-border-focus hover:text-text-accent bg-bg-main'
                    }`}
                >
                  {preset.toLocaleString()} ден.
                </button>
              ))}
            </div>
          </div>

          {/* Fine print note */}
          <div className="flex items-start gap-1.5 text-[11px] text-text-secondary font-mono pt-1">
            <span className="text-text-primary font-bold">*</span>
            <span>
              <strong className="text-text-secondary/90 font-semibold uppercase text-[10px] tracking-wider">Note:</strong> The AI engine may slightly overshoot your target budget by a small margin if it determines an upgrade offers significantly higher value or performance.
            </span>
          </div>
        </div>

        {/* Section 2: Game Selector */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-border-muted/60 pb-2">
            <div>
              <div className="text-sm font-bold tracking-widest text-text-accent uppercase flex items-center gap-2">
                <span className="text-text-primary font-mono">[02]</span>
                Target Gaming Titles (Select up to 3)
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                The algorithm optimizes GPU/CPU allocation according to hardware profiles of your chosen games.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className={`text-xs font-mono font-bold px-2.5 py-1 border ${selectedGames.length === 3
                ? 'border-text-primary text-text-primary bg-text-primary/10'
                : 'border-border-muted text-text-secondary bg-bg-main'
                }`}>
                {selectedGames.length} / 3 SELECTED
              </span>
            </div>
          </div>

          {/* Grid of Popular Games */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POPULAR_GAMES.map((game) => {
              const isSelected = selectedGames.includes(game.name);
              const isDisabled = !isSelected && selectedGames.length >= 3;

              return (
                <button
                  type="button"
                  key={game.id}
                  onClick={() => toggleGame(game.name)}
                  disabled={isDisabled}
                  className={`p-3 text-left border transition-all relative flex flex-col justify-between min-h-20 cursor-pointer ${isSelected
                    ? 'border-text-primary bg-text-primary/15 shadow-[inset_0_0_12px_rgba(143,37,245,0.2)]'
                    : isDisabled
                      ? 'border-border-muted/40 bg-bg-main/50 opacity-40 cursor-not-allowed'
                      : 'border-border-muted bg-bg-main hover:border-border-focus hover:bg-bg-panel-hover'
                    }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-sm font-bold tracking-wide leading-tight ${isSelected ? 'text-text-accent' : 'text-text-secondary'}`}>
                      {game.name}
                    </span>
                    <span className={`w-4 h-4 rounded-none border flex items-center justify-center shrink-0 text-[10px] font-bold ${isSelected ? 'border-text-primary bg-text-primary text-bg-main' : 'border-border-muted'
                      }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-bg-main" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-border-muted/30">
                    <span className="text-[10px] text-text-secondary font-mono truncate mr-2">
                      {game.genre}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 border border-border-muted text-text-secondary/80 font-mono shrink-0">
                      {game.badge}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button & Validation Alert */}
        {error && (
          <div className="bg-red-950/30 border border-red-500/40 p-4 flex items-center gap-3 text-red-300 text-xs font-mono">
            <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-text-secondary font-mono">
            {/* // SUBMITTING PAYLOAD TO: <span className="text-text-primary">/api/ai-builds/generate</span> */}
          </div>

          <button
            type="submit"
            disabled={isLoading || selectedGames.length === 0 || !budget}
            className="w-full sm:w-auto bg-text-primary text-bg-main font-bold px-8 py-3.5 text-sm uppercase tracking-widest shadow-[0_5px_0_0_rgb(73,12,133)] hover:shadow-[0_5px_0_0_rgb(73,12,133),inset_0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-75 active:translate-y-1 active:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-bg-main" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Synthesizing Rig Profile...
              </span>
            ) : (
              'Generate Optimal Rig'
            )}
          </button>
        </div>

      </form>

      {/* RESULT SECTION */}
      {result && (
        <div ref={resultsRef} className="space-y-8 animate-fadeIn pt-4">

          {/* Case 1: Build is not possible */}
          {!result.possible ? (
            <div className="bg-red-950/20 border-2 border-red-500/50 p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-lg font-bold tracking-widest text-red-400 uppercase font-display">
                  // GENERATION_STATUS: INSUFFICIENT_BUDGET_THRESHOLD
                </h2>
              </div>

              <div className="text-text-secondary text-sm leading-relaxed font-mono bg-bg-main border border-red-500/30 p-4">
                <p className="text-red-300 font-bold mb-2">
                  We weren't able to generate a build that would run these games at that price point sufficiently.
                </p>
                {result.reason && (
                  <p className="text-xs text-text-secondary mt-1">
                    <strong className="text-text-primary uppercase font-chakra">System Diagnostic: </strong>
                    {result.reason}
                  </p>
                )}
              </div>

              <div className="text-xs text-text-secondary flex items-center gap-2 pt-2">
                <span>Tip: Try increasing the budget limit or selecting titles with lower system requirements.</span>
              </div>
            </div>
          ) : (

            /* Case 2: Build is possible */
            <div className="space-y-8">

              {/* Build Summary Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-bg-panel border border-border-muted p-6 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
                      BUILD_OPTIMIZED_SUCCESSFULLY
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-text-accent uppercase tracking-widest">
                    AI Curated System Specification
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full md:w-auto">
                  <div className="bg-bg-main border border-border-muted px-8 py-3 flex flex-col justify-center text-right min-w-[260px] whitespace-nowrap shrink-0">
                    <div className="text-[10px] text-text-secondary uppercase tracking-widest font-mono whitespace-nowrap">
                      AGGREGATE BUILD COST
                    </div>
                    <div className="text-2xl font-black text-text-accent mt-0.5 whitespace-nowrap">
                      {(result.totalPrice ?? result.price ?? 0).toLocaleString()} ден.
                    </div>
                  </div>

                  <div className="flex flex-col justify-between gap-2 shrink-0">
                    <button
                      onClick={handleTransferToConfigurator}
                      className="bg-text-primary text-bg-main px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-75 border border-transparent shadow-[0_3px_0_0_rgb(73,12,133)] hover:bg-text-dulled hover:text-white active:translate-y-1 active:shadow-none cursor-pointer text-center whitespace-nowrap"
                    >
                      Open in Configurator →
                    </button>
                    <button
                      onClick={() => setIsSaveModalOpen(true)}
                      className="px-5 py-2 text-xs font-bold tracking-widest text-text-accent uppercase border border-border-muted hover:border-text-primary hover:bg-white/5 transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      Save Build to Inventory
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Build Modal */}
              <SaveBuildModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                defaultName={`AI Rig - ${Number(budget).toLocaleString()} MKD`}
                totalPrice={result.totalPrice ?? result.price ?? 0}
                partsCount={COMPONENT_SLOTS.reduce((acc, slot) => {
                  const rawPart = slot.getPart(result.pcBuild);
                  if (Array.isArray(rawPart)) return acc + rawPart.length;
                  return acc + (rawPart ? 1 : 0);
                }, 0)}
                source="AI Rig Generator"
                onSave={handleSaveAIBuild}
              />

              {/* Hardware Parts Slot List (Matching Configurator Style) */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-text-secondary px-1">
                  // SYSTEM_COMPONENT_MANIFEST
                </div>

                {COMPONENT_SLOTS.map((slot) => {
                  const rawPart = slot.getPart(result.pcBuild);
                  const isMultiple = slot.id === 'ram' || slot.id === 'disk';
                  const partsArray = isMultiple
                    ? (Array.isArray(rawPart) ? rawPart : (rawPart ? [rawPart] : []))
                    : (rawPart ? [rawPart] : []);

                  const normalizedParts = partsArray.map(normalizePart).filter(Boolean);

                  return (
                    <div
                      key={slot.id}
                      className="flex flex-col md:flex-row md:items-stretch bg-bg-panel border border-border-muted transition-colors hover:border-border-focus min-h-28"
                    >
                      {/* Slot Category Left Panel */}
                      <div className="w-full md:w-32 bg-bg-main border-b md:border-b-0 md:border-r border-border-muted px-4 py-6 md:py-8 flex flex-col items-center justify-center gap-2 shrink-0 text-center">
                        <span className="text-text-accent font-bold text-base tracking-widest uppercase leading-tight whitespace-pre-line">
                          {slot.label}
                        </span>
                        {normalizedParts.length === 0 && slot.id === 'cooler' ? (
                          <span className="text-emerald-400 text-[10px] font-mono font-bold">// INCLUDED</span>
                        ) : normalizedParts.length === 0 ? (
                          <span className="text-text-secondary text-[10px] font-mono">// NOT ASSIGNED</span>
                        ) : null}
                      </div>

                      {/* Slot Body Area */}
                      <div className="flex-1 p-4 flex flex-col justify-center">
                        {normalizedParts.length > 0 ? (
                          <div className="space-y-4">
                            {normalizedParts.map((part, idx) => (
                              <div
                                key={idx}
                                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${idx > 0 ? 'border-t border-border-muted/30 pt-4' : ''}`}
                              >
                                {/* Part Profile Info */}
                                <div className="flex items-center gap-4">
                                  {part.imageUrl ? (
                                    <img
                                      src={part.imageUrl}
                                      alt={part.name}
                                      referrerPolicy="no-referrer"
                                      className="w-20 h-20 md:w-24 md:h-24 object-contain border border-border-muted p-2 bg-bg-main shrink-0"
                                      onError={(e) => { e.target.src = 'https://placehold.co/400x400/0d0d13/38bdf8?text=NO_IMAGE'; }}
                                    />
                                  ) : (
                                    <div className="w-20 h-20 md:w-24 md:h-24 border border-border-muted bg-bg-main flex items-center justify-center text-[10px] text-text-secondary font-mono shrink-0">
                                      NO_IMG
                                    </div>
                                  )}

                                  <div className="space-y-1">
                                    {part.storeUrl ? (
                                      <Link
                                        to={`/product/details?type=${slot.id}&url=${encodeURIComponent(part.storeUrl)}`}
                                        className="text-text-primary text-base md:text-lg font-bold hover:text-text-accent transition-colors block leading-tight tracking-wide"
                                      >
                                        {part.name}
                                      </Link>
                                    ) : (
                                      <div className="text-text-primary text-base md:text-lg font-bold leading-tight tracking-wide">
                                        {part.name}
                                      </div>
                                    )}

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
                                        TYPE: <span className="text-text-primary font-bold">{part.speed || ''} {part.diskType || 'Storage'}</span> | SIZE: <span className="text-text-primary font-bold">{part.size || 'N/A'}</span>
                                        {part.connector && <span> | FORM: <span className="text-text-primary font-bold">{part.connector}</span></span>}
                                      </div>
                                    )}
                                    {slot.id === 'case' && (
                                      <div className="text-xs text-text-secondary uppercase tracking-wider">
                                        FORM FACTOR: <span className="text-text-primary font-bold">{part.formFactor || 'N/A'}</span>
                                        {part.gpuLength && <span> | GPU MAX: <span className="text-text-primary font-bold">{part.gpuLength}mm</span></span>}
                                        {part.coolerHeight && <span> | CPU MAX: <span className="text-text-primary font-bold">{part.coolerHeight}mm</span></span>}
                                      </div>
                                    )}
                                    <div className="text-xs text-text-secondary uppercase tracking-wider">
                                      VENDOR: <span className="text-text-primary font-bold">{part.storeName || 'Official'}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-border-muted pt-3 sm:pt-0 pl-4">
                                  <div className="text-right">
                                    <div className="text-text-accent font-black text-xl tracking-wide">
                                      {part.price.toLocaleString()} ден.
                                    </div>
                                    <div className="text-[10px] text-text-secondary">// REALTIME_FEED</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : slot.id === 'cooler' ? (
                          /* Cooler is null: CPU includes stock / boxed cooler */
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-20 md:w-24 md:h-24 border border-border-muted bg-bg-main flex flex-col items-center justify-center p-2 shrink-0 text-center">
                                <span className="text-2xl mb-1">📦</span>                                <span className="text-[9px] text-emerald-400 font-bold uppercase font-mono leading-none">
                                  OEM STOCK
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="text-text-primary text-base md:text-lg font-bold leading-tight tracking-wide uppercase">
                                  Stock Cooler (Included with CPU)
                                </div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider">
                                  TYPE: <span className="text-text-primary font-bold">OEM Boxed Air Cooler</span> | THERMAL PASTE: <span className="text-text-primary font-bold">Pre-applied</span>
                                </div>
                                <div className="text-xs text-text-secondary/80 leading-relaxed">
                                  The chosen processor comes with an included manufacturer stock thermal cooler rated for sufficient TDP cooling under standard gaming loads.
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-border-muted pt-3 sm:pt-0 pl-4">
                              <div className="text-right">
                                <div className="text-emerald-400 font-black text-xl tracking-wide">
                                  0 ден.
                                </div>
                                <div className="text-[10px] text-emerald-400/80 font-mono">// INCLUDED WITH CPU</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-text-secondary text-xs font-mono">
                            // No component allocated for this slot.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Architecture Reasoning Section */}
              {result.reason && (
                <div className="bg-bg-panel border border-border-muted p-6 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border-muted pb-3">
                    <h3 className="text-sm font-bold tracking-widest text-text-accent uppercase font-display">
                      // AI_ARCHITECTURAL_RATIONALE
                    </h3>
                  </div>
                  <div className="text-sm text-text-secondary font-mono leading-relaxed whitespace-pre-line bg-bg-main p-4 border border-border-muted/50">
                    {result.reason}
                  </div>
                </div>
              )}

              {/* Game FPS Estimates Section */}
              {Array.isArray(result.fpsEstimates) && result.fpsEstimates.length > 0 && (
                <div className="bg-bg-panel border border-border-muted p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-muted pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold tracking-widest text-text-accent uppercase font-display">
                        // ESTIMATED_GAMING_PERFORMANCE_TELEMETRY
                      </h3>
                    </div>
                    <span className="text-xs text-text-secondary font-mono">
                      BENCHMARK ESTIMATION ENGINE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.fpsEstimates.map((est, idx) => {
                      const badge1080 = calculateFpsBadge(est.fps1080p);
                      const badge1440 = calculateFpsBadge(est.fps1440p);
                      const badge4k = calculateFpsBadge(est.fps4k);

                      return (
                        <div
                          key={idx}
                          className="bg-bg-main border border-border-muted p-4 space-y-4 hover:border-border-focus transition-colors"
                        >
                          <div className="border-b border-border-muted/40 pb-2">
                            <span className="text-[10px] text-text-primary font-mono uppercase tracking-wider block">
                              GAME PROFILE #{idx + 1}
                            </span>
                            <h4 className="text-base font-bold text-text-accent tracking-wide leading-snug mt-0.5">
                              {est.game}
                            </h4>
                          </div>

                          <div className="space-y-2.5">
                            {/* 1080p Full HD */}
                            <div className="flex justify-between items-center bg-bg-panel/60 px-3 py-2 border border-border-muted/30">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-text-accent">1080p FHD</span>
                                <span className="text-[9px] text-text-secondary font-mono">1920x1080</span>
                              </div>
                              <span className={`text-xs font-mono font-bold px-2.5 py-1 border ${badge1080.color}`}>
                                {badge1080.label}
                              </span>
                            </div>

                            {/* 1440p Quad HD */}
                            <div className="flex justify-between items-center bg-bg-panel/60 px-3 py-2 border border-border-muted/30">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-text-accent">1440p QHD</span>
                                <span className="text-[9px] text-text-secondary font-mono">2560x1440</span>
                              </div>
                              <span className={`text-xs font-mono font-bold px-2.5 py-1 border ${badge1440.color}`}>
                                {badge1440.label}
                              </span>
                            </div>

                            {/* 4K Ultra HD */}
                            <div className="flex justify-between items-center bg-bg-panel/60 px-3 py-2 border border-border-muted/30">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-text-accent">4K UHD</span>
                                <span className="text-[9px] text-text-secondary font-mono">3840x2160</span>
                              </div>
                              <span className={`text-xs font-mono font-bold px-2.5 py-1 border ${badge4k.color}`}>
                                {badge4k.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
