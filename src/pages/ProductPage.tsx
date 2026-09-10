import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, assetUrl } from '../lib/api';
import type { Product } from '../lib/types';
import { PriceBlock } from '../lib/pricing';
import { whatsappConsultUrl } from '../lib/whatsapp';

export function ProductPage() {
  const { slug } = useParams();
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () =>
      (await api.get<Product>(`/products/slug/${slug}`)).data,
  });

  const images = useMemo(() => product?.images ?? [], [product?.images]);
  const current = images[Math.min(activeImage, Math.max(images.length - 1, 0))];

  if (isLoading) {
    return (
      <div className="container section">
        <div className="product-hero">
          <div className="skeleton" />
          <div className="stack">
            <div className="skeleton" style={{ height: 120 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section">
        <p>Producto no encontrado</p>
        <Link className="btn btn-ghost" to="/catalogo">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const waUrl = whatsappConsultUrl({
    productName: product.name,
    productUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  });

  return (
    <section className="section">
      <div className="container stack">
        <Link to="/catalogo" className="muted" style={{ width: 'fit-content' }}>
          ← Volver al catálogo
        </Link>
        <div className="product-hero">
          <div className="product-gallery">
            <div className="product-hero-media">
              <img
                src={assetUrl(current?.url)}
                alt={current?.alt || product.name}
                key={current?.id ?? 'fallback'}
              />
            </div>
            {images.length > 1 && (
              <div
                className="product-thumbs"
                role="list"
                aria-label="Fotos del producto"
              >
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    type="button"
                    role="listitem"
                    className={`product-thumb ${index === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Foto ${index + 1}`}
                    aria-pressed={index === activeImage}
                  >
                    <img
                      src={assetUrl(img.url)}
                      alt=""
                      loading={index < 4 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="stack product-buybox">
            <div>
              <p className="product-eyebrow">{product.category?.name}</p>
              <h1 className="product-title">{product.name}</h1>
              <div style={{ marginTop: '0.65rem' }}>
                <PriceBlock
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  size="lg"
                />
              </div>
            </div>
            <p className="product-desc">{product.description}</p>
            <p className="muted">
              {product.stock > 0
                ? `Stock disponible: ${product.stock}`
                : 'Sin stock — consultá disponibilidad'}
            </p>
            <a
              className="btn btn-whatsapp"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar por WhatsApp
            </a>
            <p className="product-wa-note muted">
              Respondemos por WhatsApp para stock, talle y envío.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
