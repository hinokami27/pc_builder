import ProductListingTemplate from '../components/ProductListingTemplate';

export default function CaseListingPage() {
  return (
    <ProductListingTemplate
      endpoint="case"
      title="Cases"
      renderSpecs={(product) => (
        <>
          <span>Form Factor: <span className="text-text-primary">{product.formFactor || 'N/A'}</span></span>
          <span>GPU Max: <span className="text-text-primary">{product.gpuLength ? `${product.gpuLength}mm` : 'N/A'}</span></span>
          <span>CPU Max: <span className="text-text-primary">{product.coolerHeight ? `${product.coolerHeight}mm` : 'N/A'}</span></span>
        </>
      )}
    />
  );
}