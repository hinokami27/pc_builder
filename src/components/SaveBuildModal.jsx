import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SaveBuildModal({
  isOpen,
  onClose,
  defaultName = '',
  totalPrice = 0,
  partsCount = 0,
  estimatedWattage = null,
  source = 'Configurator',
  onSave
}) {
  const navigate = useNavigate();
  const [buildName, setBuildName] = useState(defaultName);
  const [isSaved, setIsSaved] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setBuildName(defaultName || `Rig Manifest ${new Date().toLocaleDateString()}`);
      setIsSaved(false);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleConfirmSave = (e) => {
    e?.preventDefault();
    if (!buildName.trim()) return;
    onSave(buildName.trim());
    setIsSaved(true);
  };

  const handleGoToInventory = () => {
    onClose();
    navigate('/inventory');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-bg-panel border border-border-muted shadow-2xl p-6 md:p-8 space-y-6 font-chakra relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex justify-between items-center border-b border-border-muted pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-text-primary animate-pulse" />
            <h3 className="text-base font-black tracking-widest text-text-accent uppercase font-display">
              // SAVE_BUILD_TO_INVENTORY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-accent text-xs font-mono font-bold tracking-widest px-2 py-1 transition-colors cursor-pointer"
          >
            [✕]
          </button>
        </div>

        {!isSaved ? (
          <form onSubmit={handleConfirmSave} className="space-y-6">
            {/* Metadata Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-bg-main border border-border-muted p-3.5 text-xs font-mono">
              <div>
                <span className="text-text-secondary block text-[10px] uppercase">// TOTAL_COST</span>
                <span className="text-text-accent font-bold text-sm">
                  {Number(totalPrice).toLocaleString()} ден.
                </span>
              </div>
              <div>
                <span className="text-text-secondary block text-[10px] uppercase">// COMPONENTS</span>
                <span className="text-text-primary font-bold text-sm">
                  {partsCount} Allocated
                </span>
              </div>
              {estimatedWattage && (
                <div>
                  <span className="text-text-secondary block text-[10px] uppercase">// EST_WATTAGE</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ~{estimatedWattage} W
                  </span>
                </div>
              )}
            </div>

            {/* Build Name Input */}
            <div className="space-y-2">
              <label htmlFor="build-name-input" className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Assign Identifier / Build Name:
              </label>
              <div className="relative">
                <input
                  id="build-name-input"
                  ref={inputRef}
                  type="text"
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  placeholder="e.g. Stealth Gaming Rig, 1440p Beast..."
                  maxLength={60}
                  className="w-full bg-bg-main border border-border-muted focus:border-text-primary px-4 py-3 text-sm font-chakra text-text-accent outline-none tracking-wide transition-colors"
                  required
                />
                <span className="absolute right-3 top-3 text-[10px] font-mono text-text-secondary">
                  {buildName.length}/60
                </span>
              </div>
              <p className="text-[11px] text-text-secondary/70 font-mono">
                Source: <span className="text-text-primary font-semibold">{source}</span> · Saved locally in your browser storage.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold tracking-widest text-text-secondary hover:text-text-accent uppercase border border-border-muted transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!buildName.trim()}
                className="bg-text-primary text-bg-main px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-75 border border-transparent shadow-[0_3px_0_0_rgb(73,12,133)] hover:bg-text-dulled hover:text-white active:translate-y-1 active:shadow-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-center"
              >
                Commit to Inventory
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation Success State */
          <div className="space-y-6 py-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-text-accent tracking-wider uppercase font-display">
                Build Manifest Archived!
              </h4>
              <p className="text-xs text-text-secondary font-mono max-w-sm mx-auto">
                <span className="text-text-primary font-bold">"{buildName}"</span> has been saved to your local inventory manifest.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold tracking-widest text-text-secondary hover:text-text-accent uppercase border border-border-muted transition-colors cursor-pointer"
              >
                Close & Continue
              </button>
              <button
                type="button"
                onClick={handleGoToInventory}
                className="bg-text-primary text-bg-main px-6 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-75 border border-transparent shadow-[0_3px_0_0_rgb(73,12,133)] hover:bg-text-dulled hover:text-white active:translate-y-1 active:shadow-none cursor-pointer"
              >
                Open Inventory Tab →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
