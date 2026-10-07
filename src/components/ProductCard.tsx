import { Link } from 'react-router-dom';
import { imageUrl } from '../lib/api';
import { PriceBlock } from '../lib/pricing';
import type { Product } from '../lib/types';

type ProductCardProps = {
  product: Product;
  /** First cards on screen load immediately; the rest wait until they scroll in. */
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link to={`/producto/${product.slug}`} className="product-card-media">
        <img
          src={imageUrl(product.images[0]?.url, 640)}
          alt={product.name}
          width={640}
          height={640}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'low'}
        />
        {product.featured ? (
          <span className="product-card-tag">Destacado</span>
        ) : null}
      </Link>
      <div className="product-card-body">
        <Link to={`/producto/${product.slug}`} className="product-card-title">
          {product.name}
        </Link>
        {product.category?.name ? (
          <p className="product-card-cat">{product.category.name}</p>
        ) : null}
        <PriceBlock
          price={product.price}
          compareAtPrice={product.compareAtPrice}
        />
        <Link
          to={`/producto/${product.slug}`}
          className="btn btn-ghost product-card-cta"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
