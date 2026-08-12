import ProductListingTemplate from '../components/ProductListingTemplate';

const DISK_FILTERS = [
  { key: 'brand',    label: 'Brand'     },
  { key: 'size',     label: 'Capacity'  },
  { key: 'diskType', label: 'Disk Type' },
];

export default function DiskListingPage() {
  return (
    <ProductListingTemplate
      endpoint="disk"
      title="Storage_Devices"
      filters={DISK_FILTERS}
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