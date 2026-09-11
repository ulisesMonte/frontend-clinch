import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import type { Category, Product } from '../lib/types';
import { storefrontQueryOptions } from '../lib/storefront';

type ProductList = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

function groupBySubcategory(
  items: Product[],
  children: Category[],
): { section: Category; products: Product[] }[] {
  const bySlug = new Map(children.map((c) => [c.slug, [] as Product[]]));
  const leftovers: Product[] = [];

  for (const product of items) {
    const slug = product.category?.slug;
    if (slug && bySlug.has(slug)) {
      bySlug.get(slug)!.push(product);
    } else {
      leftovers.push(product);
    }
  }

  const sections = children
    .map((section) => ({
      section,
      products: bySlug.get(section.slug) ?? [],
    }))
    .filter((g) => g.products.length > 0);

  if (leftovers.length) {
    sections.push({
      section: {
        id: 'otros',
        name: 'Otros',
        slug: 'otros',
      },
      products: leftovers,
    });
  }

  return sections;
}

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const filtered = Boolean(q || category);

  const storefront = useQuery(storefrontQueryOptions());

  const filteredProducts = useQuery({
    queryKey: ['products', q, category],
    queryFn: async () => {
      const { data } = await api.get<ProductList>('/products', {
        params: {
          q: q || undefined,
          category: category || undefined,
          limit: 50,
          includeTotal: false,
        },
      });
      return data;
    },
    enabled: filtered,
    staleTime: 30_000,
  });

  // Solo categorías raíz en la barra principal (nunca subcategorías).
  const rootCategories = (storefront.data?.categories ?? []).filter(
    (c) => !c.parentId,
  );

  const products: ProductList | undefined = filtered
    ? filteredProducts.data
    : storefront.data?.products;
  const isLoading = filtered
    ? filteredProducts.isPending
    : storefront.isPending && !products?.items?.length;
  const items = products?.items ?? [];

  const guantes = rootCategories.find((c) => c.slug === 'guantes');
  const gloveSubs = guantes?.children ?? [];
  const isGloveSub = gloveSubs.some((c) => c.slug === category);
  const isGuantesView = category === 'guantes' || isGloveSub;
  const showGloveButtons = isGuantesView && gloveSubs.length > 0 && !q;

  // Con "Guantes" (todos): secciones. Con un sub-botón: grilla filtrada.
  const showSections =
    showGloveButtons && category === 'guantes' && !isGloveSub;
  const subsections = showSections
    ? groupBySubcategory(items, gloveSubs)
    : [];

  function setCategory(slug?: string) {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setParams(next);
  }

  function isMainChipActive(slug: string) {
    if (slug === 'guantes') return isGuantesView;
    return category === slug;
  }

  return (
    <section className="section catalog-page info-theme-catalog">
      <div className="info-page-media" aria-hidden="true">
        <img
          className="info-page-photo"
          src="/hero/gear.jpg"
          alt=""
          decoding="async"
        />
      </div>
      <div className="info-page-watermark" aria-hidden="true" />
      <div className="info-page-glow" aria-hidden="true" />
      <div className="info-page-veil" aria-hidden="true" />
      <div className="container catalog-page-content">
        <header className="page-band">
          <p className="page-kicker">Tienda</p>
          <h1>Catálogo</h1>
          <p>Equipamiento Clinch Fight para boxeo y deportes de contacto.</p>
        </header>

        <form
          className="search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const next = new URLSearchParams(params);
            const search = String(fd.get('q') ?? '').trim();
            if (search) next.set('q', search);
            else next.delete('q');
            setParams(next);
          }}
        >
          <input
            name="q"
            defaultValue={q}
            key={q}
            placeholder="¿Qué estás buscando?"
            aria-label="Buscar productos"
          />
          <button className="btn btn-primary" type="submit">
            Buscar
          </button>
        </form>

        <div className="filter-bar" role="tablist" aria-label="Categorías">
          <button
            type="button"
            className={`chip${!category ? ' active' : ''}`}
            onClick={() => setCategory()}
          >
            Todos
          </button>
          {rootCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`chip${isMainChipActive(cat.slug) ? ' active' : ''}`}
              onClick={() => setCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {showGloveButtons ? (
          <div
            className="filter-bar filter-bar-sub"
            role="tablist"
            aria-label="Tipo de guantes"
          >
            <button
              type="button"
              className={`chip chip-sub${category === 'guantes' ? ' active' : ''}`}
              onClick={() => setCategory('guantes')}
            >
              Todos los guantes
            </button>
            {gloveSubs.map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`chip chip-sub${category === sub.slug ? ' active' : ''}`}
                onClick={() => setCategory(sub.slug)}
              >
                {sub.name}
              </button>
            ))}
          </div>
        ) : null}

        {isLoading ? (
          <div className="product-grid catalog-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton product-card-skel" aria-hidden />
            ))}
          </div>
        ) : showSections && subsections.length ? (
          <div className="catalog-subsections">
            {subsections.map(({ section, products: sectionProducts }) => (
              <section
                key={section.id}
                className="catalog-subsection"
                aria-labelledby={`subcat-${section.slug}`}
              >
                <header className="catalog-subsection-head">
                  <h2 id={`subcat-${section.slug}`}>{section.name}</h2>
                  {section.description ? <p>{section.description}</p> : null}
                </header>
                <div className="product-grid catalog-grid">
                  {sectionProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : items.length ? (
          <div className="product-grid catalog-grid">
            {items.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay productos con ese filtro.</p>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setParams(new URLSearchParams())}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
