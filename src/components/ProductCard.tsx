import { Link } from 'react-router-dom';
import { imageUrl } from '../lib/api';
import { PriceBlock } from '../lib/pricing';
import type { Product } from '../lib/types';

type ProductCardProps = {
  product: Product;
  /** First cards on screen load immediately; the rest wait until they scroll in. */
  priority?: boolean;
  /** Home rails already name the section, so the badge is noise there. */
  showFeaturedTag?: boolean;
};

export function ProductCard({
  product,
  priority = false,
  showFeaturedTag = true,
}: ProductCardProps) {
  const photo = product.images[0]?.url;
  const src = imageUrl(photo, 640);
  const small = imageUrl(photo, 320);

  return (
    <article className="product-card">
      <Link to={`/producto/${product.slug}`} className="product-card-media">
        <img
          src={src}
          srcSet={small === src ? undefined : `${small} 320w, ${src} 640w`}
          sizes="(max-width: 640px) 46vw, 280px"
          alt={product.name}
          width={640}
          height={640}
          decoding="async"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'low'}
        />
        {showFeaturedTag && product.featured ? (
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
