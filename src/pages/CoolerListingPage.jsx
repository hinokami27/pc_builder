import ProductListingTemplate from '../components/ProductListingTemplate';

export default function CoolerListingPage() {
  return (
    <ProductListingTemplate
      endpoint="cooler"
      title="CPU_Coolers"
      renderSpecs={(product) => (
        <>
          <span>Type: <span className="text-text-primary">{product.coolerType || 'N/A'}</span></span>
          <span>Sockets: <span className="text-text-primary line-clamp-1">{product.sockets || 'N/A'}</span></span>
          {product.coolerType === 'Liquid' ? (
            <span>Radiator: <span className="text-text-primary">{product.radiatorSize || 'N/A'}</span></span>
          ) : (
            <span>Height: <span className="text-text-primary">{product.coolerHeight !== 'N/A' ? `${product.coolerHeight}mm` : 'N/A'}</span></span>
          )}
        </>
      )}
    />
  );
}