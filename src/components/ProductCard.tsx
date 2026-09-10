import { Link } from 'react-router-dom';
import { assetUrl } from '../lib/api';
import { PriceBlock } from '../lib/pricing';
import type { Product } from '../lib/types';

type ProductCardProps = {
  product: Product;
  index?: number;
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link to={`/producto/${product.slug}`} className="product-card-media">
        <img
          src={assetUrl(product.images[0]?.url)}
          alt={product.name}
          loading={index < 4 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : undefined}
          decoding="async"
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
