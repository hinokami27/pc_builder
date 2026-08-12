import ProductListingTemplate from '../components/ProductListingTemplate';

const CPU_FILTERS = [
  { key: 'socket', label: 'Socket' },
  { key: 'brand',  label: 'Brand'  },
];

export default function CpuListingPage() {
  return (
    <ProductListingTemplate
      endpoint="cpu"
      title="Processors"
      filters={CPU_FILTERS}
      renderSpecs={(product) => (
        <>
          <span>Socket: <span className="text-text-primary">{product.socket || 'N/A'}</span></span>
          <span>Brand: <span className="text-text-primary">{product.brand || 'N/A'}</span></span>
          <span>Cores/Threads: <span className="text-text-primary">{product.cores || 'N/A'}/{product.threads || 'N/A'}</span></span>
        </>
      )}
    />
  );
}