import ProductListingTemplate from '../components/ProductListingTemplate';

export default function CpuListingPage() {
  return (
    <ProductListingTemplate
      endpoint="cpu"
      title="Processors"
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