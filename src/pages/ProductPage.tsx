import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, imageUrl } from '../lib/api';
import type { Product } from '../lib/types';
import { PriceBlock } from '../lib/pricing';
import { findStorefrontProduct } from '../lib/storefront';
import { whatsappConsultUrl } from '../lib/whatsapp';

function HeroPhoto({ url, alt }: { url?: string; alt: string }) {
  const small = imageUrl(url, 320);
  const mid = imageUrl(url, 640);
  const large = imageUrl(url, 1280);
  const stored = /\/(320|640|1280)\.webp$/.test(large.split('?')[0]);
  const [src, setSrc] = useState(stored ? small : large);

  useEffect(() => {
    const stored = /\/(320|640|1280)\.webp$/.test(large.split('?')[0]);
    if (!stored) {
      setSrc(large);
      return;
    }
    const order = [small, mid, large].filter(
      (item, index, all) => all.indexOf(item) === index,
    );
    let reached = 0;
    let cancel = false;
    setSrc(order[0]);
    order.forEach((next, index) => {
      if (index === 0) return;
      const img = new Image();
      img.onload = () => {
        if (cancel || index < reached) return;
        reached = index;
        setSrc(next);
      };
      img.src = next;
    });
    return () => {
      cancel = true;
    };
  }, [small, mid, large]);

  return (
    <img
      src={src}
      alt={alt}
      width={1280}
      height={1280}
      decoding="async"
      fetchPriority="high"
    />
  );
}

export function ProductPage() {
  const { slug } = useParams();
  const [activeImage, setActiveImage] = useState(0);
  const cached = findStorefrontProduct(slug);

  const { data, isPending } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () =>
      (await api.get<Product>(`/products/slug/${slug}`)).data,
    enabled: Boolean(slug),
    placeholderData: cached,
  });

  const product = data ?? cached;

  useEffect(() => {
    setActiveImage(0);
  }, [slug]);

  const images = useMemo(() => product?.images ?? [], [product?.images]);
  const current = images[Math.min(activeImage, Math.max(images.length - 1, 0))];

  if (!product && isPending) {
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
              <HeroPhoto
                url={current?.url}
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
                      src={imageUrl(img.url, 320)}
                      alt=""
                      width={320}
                      height={320}
                      decoding="async"
                      loading={index < 4 ? 'eager' : 'lazy'}
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
