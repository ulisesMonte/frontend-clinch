import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProductRail } from '../components/ProductRail';
import { scrollToSection } from '../lib/scroll';
import { storefrontQueryOptions } from '../lib/storefront';
import type { Product } from '../lib/types';

export function HomePage() {
  const location = useLocation();
  const { data, isPending, isError } = useQuery(storefrontQueryOptions());

  const featured = data?.featured ?? [];
  const allProducts = data?.products?.items ?? [];
  const offers = allProducts.filter(hasCompareOffer);
  const showSkeletons = isPending && !allProducts.length;

  useEffect(() => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash) return;
    const t = window.setTimeout(() => scrollToSection(hash), 80);
    return () => window.clearTimeout(t);
  }, [location.hash, data]);

  return (
    <>
      <section className="hero-plane" aria-label="Inicio">
        <div className="hero-plane-media" aria-hidden="true">
          <img
            className="hero-plane-photo"
            src="/hero/ring.jpg"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </div>
        <div className="hero-plane-watermark" aria-hidden="true" />
        <div className="hero-plane-glow" aria-hidden="true" />
        <div className="hero-plane-veil" aria-hidden="true" />
        <div className="container hero-plane-inner">
          <h1 className="hero-title">
            CLINCH <span className="hero-title-fight">FIGHT</span>
          </h1>
          <p className="hero-copy">
            Guantes, protecciones e indumentaria para entrenar y competir.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => scrollToSection('ofertas')}
            >
              Ver ofertas
            </button>
            <Link to="/catalogo" className="btn btn-ghost">
              Ver catálogo
            </Link>
          </div>
        </div>
        <button
          type="button"
          className="hero-scroll-hint"
          aria-label="Bajar a ofertas"
          onClick={() => scrollToSection('ofertas')}
        >
          <span />
        </button>
      </section>

      <CatalogBlock
        id="ofertas"
        kicker="Tienda"
        title="Ofertas"
        subtitle="Descuentos activos para armar tu equipo sin pagar de más."
        products={offers}
        loading={showSkeletons}
        emptyMessage={
          isError
            ? 'No se pudieron cargar las ofertas.'
            : 'Por ahora no hay ofertas activas.'
        }
      />

      <CatalogBlock
        id="destacados"
        kicker="Selección"
        title="Destacados"
        subtitle="Lo esencial para el ring y el gym, curado por Clinch Fight."
        products={featured}
        loading={showSkeletons}
        tone="atmosphere"
        emptyMessage={
          isError
            ? 'No se pudieron cargar los destacados.'
            : 'Todavía no hay destacados. Marcá productos desde el admin.'
        }
      />
    </>
  );
}

function CatalogBlock({
  id,
  kicker,
  title,
  subtitle,
  products,
  loading,
  emptyMessage,
  tone,
}: {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  tone?: 'atmosphere';
}) {
  return (
    <section
      id={id}
      className={`section catalog-section${tone === 'atmosphere' ? ' catalog-section-atmosphere' : ''}`}
    >
      {tone === 'atmosphere' ? (
        <div className="catalog-atmosphere" aria-hidden="true" />
      ) : null}
      <div className="container">
        <div className="catalog-section-head">
          <div className="catalog-section-copy">
            <p className="catalog-kicker">{kicker}</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <Link to="/catalogo" className="catalog-section-link">
            Ver todo
          </Link>
        </div>
        <div className="catalog-stage">
          <ProductRail
            products={products}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </section>
  );
}

function hasCompareOffer(p: Product) {
  if (p.compareAtPrice == null || p.compareAtPrice === '') return false;
  return Number(p.compareAtPrice) > Number(p.price);
}
