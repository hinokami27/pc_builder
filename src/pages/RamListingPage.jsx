import ProductListingTemplate from '../components/ProductListingTemplate';

export default function RamListingPage() {
  return (
    <ProductListingTemplate
      endpoint="ram"
      title="Memory_Modules"
      renderSpecs={(product) => (
        <>
          <span>Capacity: <span className="text-text-primary">{product.ramSize || 'N/A'}</span></span>
          <span>Speed: <span className="text-text-primary">{product.ramSpeed || 'N/A'}</span></span>
          <span>Type: <span className="text-text-primary">{product.ramType || 'N/A'}</span></span>
        </>
      )}
    />
  );
}