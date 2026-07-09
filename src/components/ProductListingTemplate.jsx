import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

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

export default function ProductListingTemplate({ endpoint, title, renderSpecs }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const fromConfigurator = searchParams.get('fromConfigurator') === 'true';

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        if (fromConfigurator) {
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
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(dto)
          });
        } else {
          response = await fetch(`http://localhost:8080/api/${endpoint}/all`);
        }

        if (!response.ok) {
          const errorDetail = await response.text();
          throw new Error(`Failed to load ${endpoint} modules: ${response.statusText} - ${errorDetail}`);
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
  }, [endpoint, fromConfigurator]);

  return (
    <div className="py-12 space-y-8 font-chakra">
      {/* Contextual Header */}
      <div className="flex justify-between items-end border-b border-border-muted pb-6">
        <div>
          <Link 
            to={fromConfigurator ? "/configurator" : "/products"} 
            className="text-text-accent text-xs uppercase tracking-widest underline underline-offset-2 hover:text-text-primary hover:decoration-2 transition-all duration-200 mb-2 block"
          >
            &lt; {fromConfigurator ? "Back to Configurator" : "Back to Categories"}
          </Link>
          <h1 className="text-3xl font-black text-text-primary tracking-widest uppercase">
            {title}_Index
          </h1>
        </div>
        <div className="text-text-secondary text-xs font-mono">
          RESULTS_COUNT: {products.length}
        </div>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full bg-bg-panel border border-border-muted border-dashed p-20 text-center text-text-secondary uppercase tracking-widest text-sm">
            // Synchronizing with global repository...
          </div>
        ) : error ? (
          <div className="col-span-full bg-bg-panel border border-text-accent p-20 text-center text-text-accent uppercase tracking-widest text-sm">
            // ERROR_CRITICAL: {error}
          </div>
        ) : products.length > 0 ? products.map((product) => (
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
                  className="bg-text-primary text-bg-main px-3 py-1.5 text-[10px] font-black tracking-widest uppercase shadow-[0_3px_0_0_rgb(73,12,133)] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  Select
                </Link>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full bg-bg-panel border border-border-muted border-dashed p-20 text-center text-text-secondary uppercase tracking-widest text-sm">
            // No data modules found for this category index.
          </div>
        )}
      </div>
    </div>
  );
}
