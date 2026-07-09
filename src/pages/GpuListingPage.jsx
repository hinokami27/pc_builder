import ProductListingTemplate from '../components/ProductListingTemplate';

export default function GpuListingPage() {
  return (
    <ProductListingTemplate
      endpoint="gpu"
      title="Graphics_Cards"
      renderSpecs={(product) => (
        <>
          <span>VRAM: <span className="text-text-primary">{product.vram || 'N/A'}</span></span>
          <span>Chipset: <span className="text-text-primary">{product.chipset || 'N/A'}</span></span>
          <span>Length: <span className="text-text-primary">{product.length ? `${product.length}mm` : 'N/A'}</span></span>
        </>
      )}
    />
  );
}