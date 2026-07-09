import ProductListingTemplate from '../components/ProductListingTemplate';

export default function DiskListingPage() {
  return (
    <ProductListingTemplate
      endpoint="disk"
      title="Storage_Devices"
      renderSpecs={(product) => (
        <>
          <span>Size: <span className="text-text-primary">{product.size || 'N/A'}</span></span>
          <span>Type: <span className="text-text-primary">{product.diskType || 'N/A'}</span></span>
          <span>Connector: <span className="text-text-primary">{product.connector || 'N/A'}</span></span>
        </>
      )}
    />
  );
}