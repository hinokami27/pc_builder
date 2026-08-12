import ProductListingTemplate from '../components/ProductListingTemplate';

const RAM_FILTERS = [
  { key: 'brand',   label: 'Brand'    },
  { key: 'ramSize', label: 'Capacity' },
  { key: 'ramType', label: 'Type'     },
];

export default function RamListingPage() {
  return (
    <ProductListingTemplate
      endpoint="ram"
      title="Memory_Modules"
      filters={RAM_FILTERS}
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