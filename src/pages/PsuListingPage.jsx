import ProductListingTemplate from '../components/ProductListingTemplate';

export default function PsuListingPage() {
  return (
    <ProductListingTemplate
      endpoint="psu"
      title="Power_Supplies"
      renderSpecs={(product) => (
        <>
          <span>Wattage: <span className="text-text-primary">{product.wattage || 'N/A'}</span></span>
          <span>Efficiency: <span className="text-text-primary">{product.efficiency || 'N/A'}</span></span>
          <span>Modular: <span className="text-text-primary">{product.modular || 'N/A'}</span></span>
        </>
      )}
    />
  );
}