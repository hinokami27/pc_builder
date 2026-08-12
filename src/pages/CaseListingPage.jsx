import ProductListingTemplate from '../components/ProductListingTemplate';

const CASE_FILTERS = [
  { key: 'brand', label: 'Brand' },
  { key: 'formFactor', label: 'Form Factor' },
];

export default function CaseListingPage() {
  return (
    <ProductListingTemplate
      endpoint="case"
      title="Cases"
      filters={CASE_FILTERS}
      renderSpecs={(product) => (
        <>
          <span>Form Factor: <span className="text-text-primary">{product.formFactor || 'N/A'}</span></span>
          <span>GPU Max: <span className="text-text-primary">{product.gpuLength !== 'N/A' ? `${product.gpuLength}mm` : 'N/A'}</span></span>
          <span>CPU Max: <span className="text-text-primary">{product.coolerHeight !== 'N/A' ? `${product.coolerHeight}mm` : 'N/A'}</span></span>
        </>
      )}
    />
  );
}