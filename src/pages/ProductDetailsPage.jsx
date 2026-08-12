import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function ProductDetailsPage() {
  const [searchParams] = useSearchParams();
  const storeUrl = searchParams.get('url');
  const componentType = searchParams.get('type');

  const [product, setProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!storeUrl || !componentType) {
        setError("Missing reference parameters.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetching from the dynamic category endpoint
        const response = await fetch(`http://localhost:8080/api/${componentType}/find?url=${encodeURIComponent(storeUrl)}`);
        if (!response.ok) {
          throw new Error(`Failed to locate module in registry: ${response.statusText}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [storeUrl, componentType]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!storeUrl) return;
      setIsHistoryLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/price/history?url=${encodeURIComponent(storeUrl)}`);
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
          setPriceHistory(sorted);
        }
      } catch (err) {
        console.error("Failed to synchronize price history:", err);
      } finally {
        setIsHistoryLoading(false);
      }
    };

    if (storeUrl) fetchHistory();
  }, [storeUrl]);

  const renderChart = () => {
    if (isHistoryLoading) return <div className="h-48 flex items-center justify-center text-[10px] text-text-secondary animate-pulse">// SCANNING_HISTORICAL_INDEX...</div>;
    if (priceHistory.length < 2) return <div className="h-48 flex items-center justify-center text-[10px] text-text-secondary opacity-40 italic">INSUFFICIENT_DATA_POINTS_FOR_TREND_ANALYSIS</div>;

    const prices = priceHistory.map(h => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.3 || 200;
    const yMin = minPrice - padding;
    const yMax = maxPrice + padding;
    const yRange = yMax - yMin;

    const width = 1000;
    const height = 200;

    const points = priceHistory.map((h, i) => {
      const x = (i / (priceHistory.length - 1)) * width;
      const y = height - ((h.price - yMin) / yRange) * height;
      return { x, y, price: h.price, date: h.date };
    });

    const linePath = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return (
      <div className="relative pt-6">
        <div className="flex justify-between text-xs text-text-secondary font-mono mb-4 px-1">
          <span>START: {new Date(priceHistory[0].date).toLocaleDateString()}</span>
          <span className="text-text-primary font-bold tracking-[0.3em]">MARKET_VOLATILITY_MONITOR</span>
          <span>END: {new Date(priceHistory[priceHistory.length - 1].date).toLocaleDateString()}</span>
        </div>
        <svg viewBox={`0 -40 ${width} ${height + 100}`} className="w-full h-64 overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8f25f5" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8f25f5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#chartGradient)" />
          <path d={linePath} fill="none" stroke="#8f25f5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#121212" stroke="#8f25f5" strokeWidth="2" />
              <text x={p.x} y={p.y - 18} textAnchor="middle" className="text-[14px] fill-text-accent font-bold font-mono">
                {p.price.toLocaleString()}
              </text>
              <text x={p.x} y={height + 30} textAnchor="middle" className="text-[11px] fill-text-secondary font-mono">
                {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center font-chakra text-text-secondary uppercase tracking-widest animate-pulse">
        // Accessing encrypted component data...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-24 text-center font-chakra">
        <div className="text-text-accent mb-4">// ERROR_UNABLE_TO_LOCATE_PART</div>
        <p className="text-sm text-text-secondary mb-8">{error || "Data stream interrupted."}</p>
        <Link to="/products" className="bg-text-primary text-bg-main px-6 py-2 text-xs font-bold uppercase tracking-widest shadow-[0_3px_0_0_rgb(73,12,133)]">
          Return to Index
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 space-y-12 font-chakra">
      {/* Navigation Breadcrumb */}
      <Link to={-1} className="text-text-accent text-sm uppercase tracking-widest underline underline-offset-2 hover:text-text-primary hover:decoration-2 transition-all duration-200 block">
        &lt; Go Back
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-bg-panel border border-border-muted p-8">
        {/* Left: Product Visual */}
        <div className="flex items-center justify-center bg-bg-main border border-border-muted p-10">
          <img
            src={product.imgUrl}
            alt={product.modelName}
            referrerPolicy="no-referrer"
            className="max-h-80 object-contain"
            onError={(e) => { e.target.src = 'https://placehold.co/400x400/0d0d13/38bdf8?text=NO_IMAGE'; }}
          />
        </div>

        {/* Right: Technical Specs */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-text-primary tracking-[0.2em] uppercase mb-1">{product.storeName || 'OEM_UNSPECIFIED'}</div>
            <h1 className="text-3xl font-black text-text-accent leading-tight uppercase italic">{product.modelName}</h1>
          </div>

          <div className="text-4xl font-black text-text-primary">
            {product.priceMkd?.toLocaleString() || 0} <span className="text-lg">ДЕН.</span>
          </div>

          <div className="border-t border-border-muted pt-6 space-y-4">
            <h2 className="text-xs font-bold text-text-secondary tracking-widest uppercase">// MODULE_SPECIFICATIONS</h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              {Object.entries(product).map(([key, value]) => {
                // Filter out large/unnecessary fields for the list
                if (['id', 'imgUrl', 'storeUrl', 'modelName', 'storeName', 'priceMkd'].includes(key)) return null;
                return (
                  <div key={key} className="flex justify-between border-b border-border-muted/30 pb-1">
                    <span className="text-text-secondary uppercase opacity-60">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-text-primary font-mono">{String(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <Link
              to={`/configurator?type=${componentType}&url=${encodeURIComponent(product.storeUrl)}`}
              className="flex-1 bg-text-primary text-bg-main py-3 font-black tracking-widest uppercase shadow-[0_4px_0_0_rgb(73,12,133)] hover:cursor-pointer active:translate-y-1 active:shadow-none transition-all text-center"
            >
              Add to Manifest
            </Link>
            <a href={product.storeUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-border-muted text-text-accent text-xs font-bold uppercase tracking-widest flex items-center hover:bg-bg-panel-hover">
              View at Source
            </a>
          </div>
        </div>

        {/* Bottom: Price History Telemetry */}
        <div className="col-span-full border-t border-border-muted pt-8 mt-4">
          <h2 className="text-xs font-bold text-text-secondary tracking-widest uppercase mb-2">// UNIT_PRICE_TREND_DATA</h2>
          {renderChart()}
        </div>
      </div>
    </div>
  );
}