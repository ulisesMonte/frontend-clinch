import { useRef } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '../lib/types';

type ProductRailProps = {
  products: Product[];
  emptyMessage?: string;
  loading?: boolean;
};

export function ProductRail({
  products,
  emptyMessage = 'Todavía no hay productos en esta sección.',
  loading = false,
}: ProductRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.85, 320),
      behavior: 'smooth',
    });
  }

  if (loading) {
    return (
      <div className="catalog-rail" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton product-card-skel catalog-rail-slide" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <p className="muted catalog-rail-empty">{emptyMessage}</p>;
  }

  return (
    <div className="catalog-rail-wrap">
      <button
        type="button"
        className="rail-arrow rail-arrow-prev"
        aria-label="Producto anterior"
        onClick={() => scrollBy(-1)}
      >
        ‹
      </button>
      <div className="catalog-rail" ref={scrollerRef}>
        {products.map((product, index) => (
          <div key={product.id} className="catalog-rail-slide">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
      <button
        type="button"
        className="rail-arrow rail-arrow-next"
        aria-label="Producto siguiente"
        onClick={() => scrollBy(1)}
      >
        ›
      </button>
    </div>
  );
}
