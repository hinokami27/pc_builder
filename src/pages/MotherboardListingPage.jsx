import ProductListingTemplate from '../components/ProductListingTemplate';

export default function MotherboardListingPage() {
  return (
    <ProductListingTemplate
      endpoint="motherboard"
      title="Motherboards"
      renderSpecs={(product) => (
        <>
          <span>Socket: <span className="text-text-primary">{product.socket || 'N/A'}</span></span>
          <span>Chipset: <span className="text-text-primary">{product.chipset || 'N/A'}</span></span>
          <span>Form Factor: <span className="text-text-primary">{product.formFactor || 'N/A'}</span></span>
        </>
      )}
    />
  );
}