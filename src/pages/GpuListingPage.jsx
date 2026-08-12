import ProductListingTemplate from '../components/ProductListingTemplate';

const GPU_FILTERS = [
  { key: 'brand',     label: 'Brand'    },
  { key: 'chipMaker', label: 'Chip Maker' },
  { key: 'chipset',   label: 'Chipset'  },
];

export default function GpuListingPage() {
  return (
    <ProductListingTemplate
      endpoint="gpu"
      title="Graphics_Cards"
      filters={GPU_FILTERS}
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