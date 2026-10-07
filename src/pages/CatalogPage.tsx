import { useMemo } from 'react';
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

/** Parent chip includes its subcategories (Guantes → boxeo, MMA, …). */
function slugsForCategory(categories: Category[], slug: string) {
  const slugs = new Set<string>([slug]);
  const walk = (nodes: Category[]) => {
    for (const node of nodes) {
      if (node.slug === slug) {
        for (const child of node.children ?? []) slugs.add(child.slug);
      }
      if (node.children?.length) walk(node.children);
    }
  };
  walk(categories);
  return slugs;
}

function filterCatalog(
  items: Product[],
  categories: Category[],
  category: string,
  q: string,
) {
  const query = q.trim().toLowerCase();
  const allowed = category ? slugsForCategory(categories, category) : null;
  return items.filter((product) => {
    if (allowed && !allowed.has(product.category?.slug ?? '')) return false;
    if (!query) return true;
    const haystack = `${product.name} ${product.description ?? ''}`.toLowerCase();
    return haystack.includes(query);
  });
}

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

  const storefront = useQuery(storefrontQueryOptions());
  const cachedItems = storefront.data?.products.items ?? [];
  const categories = storefront.data?.categories ?? [];
  const localItems = useMemo(
    () => filterCatalog(cachedItems, categories, category, q),
    [cachedItems, categories, category, q],
  );

  // Bootstrap is one page. A full page may hide older products, so a text
  // search still asks the API. Category chips use the list already on screen.
  const cacheMayBePartial =
    cachedItems.length > 0 &&
    cachedItems.length >= (storefront.data?.products.limit ?? cachedItems.length);
  const needsNetwork = Boolean(q) && cacheMayBePartial;

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
    enabled: needsNetwork,
    staleTime: 30_000,
    placeholderData: localItems.length
      ? {
          items: localItems,
          total: localItems.length,
          page: 1,
          limit: localItems.length,
          pages: 1,
        }
      : undefined,
  });

  // Solo categorías raíz en la barra principal (nunca subcategorías).
  const rootCategories = categories.filter((c) => !c.parentId);

  const items = needsNetwork
    ? (filteredProducts.data?.items ?? localItems)
    : localItems;
  const isLoading = storefront.isPending && !cachedItems.length && !items.length;

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
        ) : items.length ? (
          <div className="product-grid catalog-grid">
            {showSections && subsections.length
              ? subsections.flatMap(({ section, products: sectionProducts }) => [
                  <header
                    key={`head-${section.id}`}
                    className="catalog-subsection-head catalog-grid-span"
                  >
                    <h2 id={`subcat-${section.slug}`}>{section.name}</h2>
                    {section.description ? <p>{section.description}</p> : null}
                  </header>,
                  ...sectionProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  )),
                ])
              : items.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
