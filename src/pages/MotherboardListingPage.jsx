import ProductListingTemplate from '../components/ProductListingTemplate';

const MOTHERBOARD_FILTERS = [
  { key: 'brand',      label: 'Brand'       },
  { key: 'formFactor', label: 'Form Factor' },
  { key: 'socket',     label: 'Socket'      },
  { key: 'chipset',    label: 'Chipset'     },
];

export default function MotherboardListingPage() {
  return (
    <ProductListingTemplate
      endpoint="motherboard"
      title="Motherboards"
      filters={MOTHERBOARD_FILTERS}
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