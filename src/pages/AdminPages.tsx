import { FormEvent, useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, assetUrl } from '../lib/api';
import type { Category, Product } from '../lib/types';
import { useAuth } from '../lib/auth';
import { invalidateStorefront } from '../lib/storefront';
import { PriceBlock } from '../lib/pricing';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    void qc.prefetchQuery({
      queryKey: ['admin-products'],
      queryFn: async () => (await api.get<Product[]>('/products/admin/all')).data,
      staleTime: 20_000,
    });
  }, [qc]);

  return (
    <div className="container admin-layout">
      <aside className="admin-side">
        <h3 style={{ marginBottom: '0.35rem' }}>Admin</h3>
        <p className="muted" style={{ fontSize: '0.82rem', marginTop: 0 }}>
          {user?.firstName ? `Hola, ${user.firstName}` : 'Panel Clinch'}
        </p>
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/productos">Publicaciones</NavLink>
        <NavLink to="/admin/stock">Stock</NavLink>
        <NavLink to="/admin/cuenta">Cuenta</NavLink>
        <Link to="/">Volver a tienda</Link>
        <button
          className="btn btn-ghost"
          type="button"
          style={{ marginTop: '0.75rem', width: '100%' }}
          onClick={() => void logout()}
        >
          Salir
        </button>
      </aside>
      <div className="stack admin-main" style={{ minHeight: 420 }}>
        <Outlet />
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-bootstrap'],
    queryFn: async () => (await api.get('/admin/bootstrap')).data,
    staleTime: 20_000,
  });

  const stats = data?.dashboard;

  return (
    <div className="stack admin-page-enter">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div>
          <h2>Dashboard</h2>
          <p>Catálogo y stock de la tienda.</p>
        </div>
        <button
          className="btn btn-ghost"
          type="button"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          {isFetching ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {isLoading && !stats ? (
        <div className="stats">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88 }} />
          ))}
        </div>
      ) : (
        <div className="stats">
          <div className="stat">
            <span className="muted">Productos</span>
            <strong>{stats?.totalProducts ?? 0}</strong>
          </div>
          <div className="stat">
            <span className="muted">Activos</span>
            <strong>{stats?.activeProducts ?? 0}</strong>
          </div>
          <div className="stat">
            <span className="muted">Destacados</span>
            <strong>{stats?.featuredProducts ?? 0}</strong>
          </div>
          <div className="stat">
            <span className="muted">Stock bajo</span>
            <strong>{stats?.lowStock ?? 0}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

function apiErrorMessage(err: unknown, fallback = 'Error') {
  const msg = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (msg) return String(msg);
  return fallback;
}

async function uploadProductImage(productId: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  await api.post(`/products/${productId}/images`, fd);
}

export function AdminProductsPage() {
  const qc = useQueryClient();
  const [error, setError] = useState('');
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get<Product[]>('/products/admin/all')).data,
    staleTime: 20_000,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const editing = products?.find((p) => p.id === editingId) ?? null;

  const uploadImage = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      await uploadProductImage(id, file);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateStorefront();
    },
  });

  const removeImage = useMutation({
    mutationFn: async ({
      productId,
      imageId,
    }: {
      productId: string;
      imageId: string;
    }) => {
      await api.delete(`/products/${productId}/images/${imageId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateStorefront();
    },
  });

  const removeProduct = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: (_, id) => {
      if (editingId === id) setEditingId(null);
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateStorefront();
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api.patch(`/products/${id}`, { active });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateStorefront();
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      await api.patch(`/products/${id}`, { featured });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateStorefront();
    },
  });

  function clearPendingImages() {
    setPendingImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return [];
    });
  }

  function onPickImages(files: FileList | null) {
    if (!files?.length) return;
    const next: PendingImage[] = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    setPendingImages((prev) => [...prev, ...next].slice(0, 8));
  }

  function removePendingImage(id: string) {
    setPendingImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  }

  function parseCompareAt(raw: FormDataEntryValue | null) {
    const s = String(raw ?? '').trim();
    if (!s) return null;
    return Number(s);
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setCreating(true);
    setError('');

    try {
      const { data: created } = await api.post<Product>('/products', {
        name: String(fd.get('name')),
        description: String(fd.get('description')),
        price: Number(fd.get('price')),
        compareAtPrice: parseCompareAt(fd.get('compareAtPrice')),
        stock: Number(fd.get('stock')),
        categoryId: String(fd.get('categoryId')),
        featured: fd.get('featured') === 'on',
        active: true,
      });

      try {
        for (const img of pendingImages) {
          await uploadProductImage(created.id, img.file);
        }
      } catch (imgErr) {
        setError(
          apiErrorMessage(
            imgErr,
            'Producto creado, pero falló la subida de imágenes al storage',
          ),
        );
        await qc.invalidateQueries({ queryKey: ['admin-products'] });
        invalidateStorefront();
        return;
      }

      clearPendingImages();
      form.reset();
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateStorefront();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo crear el producto'));
    } finally {
      setCreating(false);
    }
  }

  async function onSaveEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);
    setSavingEdit(true);
    setEditError('');

    try {
      await api.patch(`/products/${editing.id}`, {
        name: String(fd.get('name')),
        description: String(fd.get('description')),
        price: Number(fd.get('price')),
        compareAtPrice: parseCompareAt(fd.get('compareAtPrice')),
        stock: Number(fd.get('stock')),
        categoryId: String(fd.get('categoryId')),
        featured: fd.get('featured') === 'on',
        active: fd.get('active') === 'on',
      });
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateStorefront();
      setEditingId(null);
    } catch (err) {
      setEditError(apiErrorMessage(err, 'No se pudo guardar'));
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="stack admin-page-enter">
      <h2>Publicaciones</h2>
      <p className="muted" style={{ marginTop: '-0.35rem' }}>
        ABM de productos de la tienda. Para ajustar cantidades usá{' '}
        <Link to="/admin/stock">Administrador de stock</Link>.
      </p>
      <form className="panel form" onSubmit={(e) => void onCreate(e)}>
        <h3>Nuevo producto</h3>
        <label>
          Nombre
          <input name="name" required />
        </label>
        <label>
          Descripción
          <textarea name="description" required minLength={10} rows={3} />
        </label>
        <div className="row">
          <label style={{ flex: 1 }}>
            Precio
            <input name="price" type="number" min={0} step="0.01" required />
          </label>
          <label style={{ flex: 1 }}>
            Precio anterior (oferta)
            <input
              name="compareAtPrice"
              type="number"
              min={0}
              step="0.01"
              placeholder="Opcional"
            />
          </label>
          <label style={{ flex: 1 }}>
            Stock
            <input name="stock" type="number" min={0} required />
          </label>
          <label style={{ flex: 1 }}>
            Categoría
            <select name="categoryId" required defaultValue="">
              <option value="" disabled>
                Elegí
              </option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="muted" style={{ fontSize: '0.82rem', margin: 0 }}>
          Si cargás un precio anterior mayor al precio, se muestra como oferta
          en la tienda.
        </p>

        <div className="admin-images-field">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Imágenes</strong>
            <span className="muted" style={{ fontSize: '0.82rem' }}>
              Se guardan en Supabase Storage · JPG/PNG/WebP · máx. 5MB · hasta 8
            </span>
          </div>
          <label className="admin-images-drop">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                onPickImages(e.target.files);
                e.target.value = '';
              }}
            />
            <span>Elegí una o más imágenes</span>
          </label>
          {pendingImages.length > 0 && (
            <div className="admin-images-grid">
              {pendingImages.map((img, index) => (
                <div key={img.id} className="admin-image-thumb">
                  <img src={img.previewUrl} alt={img.file.name} />
                  {index === 0 && <span className="admin-image-badge">Principal</span>}
                  <button
                    type="button"
                    className="admin-image-remove"
                    aria-label={`Quitar ${img.file.name}`}
                    onClick={() => removePendingImage(img.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="row">
          <input name="featured" type="checkbox" /> Destacado
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={creating}>
          {creating ? 'Creando…' : 'Crear producto'}
        </button>
      </form>

      {editing && (
        <form
          key={editing.id}
          className="panel form"
          onSubmit={(e) => void onSaveEdit(e)}
        >
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Editar: {editing.name}</h3>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setEditingId(null);
                setEditError('');
              }}
            >
              Cerrar
            </button>
          </div>
          <label>
            Nombre
            <input name="name" required defaultValue={editing.name} />
          </label>
          <label>
            Descripción
            <textarea
              name="description"
              required
              minLength={10}
              rows={3}
              defaultValue={editing.description}
            />
          </label>
          <div className="row">
            <label style={{ flex: 1 }}>
              Precio
              <input
                name="price"
                type="number"
                min={0}
                step="0.01"
                required
                defaultValue={Number(editing.price)}
              />
            </label>
            <label style={{ flex: 1 }}>
              Precio anterior (oferta)
              <input
                name="compareAtPrice"
                type="number"
                min={0}
                step="0.01"
                placeholder="Opcional"
                defaultValue={
                  editing.compareAtPrice != null
                    ? Number(editing.compareAtPrice)
                    : ''
                }
              />
            </label>
            <label style={{ flex: 1 }}>
              Stock
              <input
                name="stock"
                type="number"
                min={0}
                required
                defaultValue={editing.stock}
              />
            </label>
            <label style={{ flex: 1 }}>
              Categoría
              <select
                name="categoryId"
                required
                defaultValue={editing.categoryId}
              >
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="row">
            <label className="row">
              <input
                name="active"
                type="checkbox"
                defaultChecked={editing.active}
              />{' '}
              Activo
            </label>
            <label className="row">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={editing.featured}
              />{' '}
              Destacado
            </label>
          </div>

          <div className="admin-images-field admin-edit-panel">
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Imágenes ({editing.images.length})</strong>
              <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
                Agregar
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files?.length) return;
                    void (async () => {
                      for (const file of Array.from(files)) {
                        await uploadImage.mutateAsync({
                          id: editing.id,
                          file,
                        });
                      }
                    })();
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            {editing.images.length > 0 ? (
              <div className="admin-images-grid">
                {editing.images.map((img, index) => (
                  <div key={img.id} className="admin-image-thumb">
                    <img src={assetUrl(img.url)} alt={img.alt || editing.name} />
                    {index === 0 && (
                      <span className="admin-image-badge">Principal</span>
                    )}
                    <button
                      type="button"
                      className="admin-image-remove"
                      aria-label="Eliminar imagen"
                      disabled={removeImage.isPending}
                      onClick={() => {
                        if (
                          !window.confirm('¿Eliminar esta imagen?')
                        ) {
                          return;
                        }
                        removeImage.mutate({
                          productId: editing.id,
                          imageId: img.id,
                        });
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Sin imágenes todavía.</p>
            )}
          </div>

          {editError && <p className="error">{editError}</p>}
          <div className="row">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={savingEdit}
            >
              {savingEdit ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              disabled={removeProduct.isPending}
              onClick={() => {
                if (
                  !window.confirm(
                    `¿Eliminar "${editing.name}"? Esta acción no se puede deshacer.`,
                  )
                ) {
                  return;
                }
                removeProduct.mutate(editing.id);
              }}
            >
              Eliminar producto
            </button>
          </div>
        </form>
      )}

      <div className="panel" style={{ overflowX: 'auto' }}>
        {loadingProducts && !products ? (
          <div className="stack">
            <div className="skeleton" style={{ height: 44 }} />
            <div className="skeleton" style={{ height: 44 }} />
            <div className="skeleton" style={{ height: 44 }} />
          </div>
        ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Img</th>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id}>
                <td>
                  <img
                    src={assetUrl(p.images[0]?.url)}
                    alt={p.name}
                    style={{ width: 48, height: 48, objectFit: 'cover' }}
                  />
                </td>
                <td>
                  {p.name}
                  {p.featured ? ' ★' : ''}
                  {p.images.length > 1 ? (
                    <span className="muted" style={{ display: 'block', fontSize: '0.78rem' }}>
                      {p.images.length} imágenes
                    </span>
                  ) : null}
                </td>
                <td>
                  <PriceBlock
                    price={p.price}
                    compareAtPrice={p.compareAtPrice}
                  />
                </td>
                <td>{p.stock}</td>
                <td>{p.active ? 'Activo' : 'Oculto'}</td>
                <td>
                  <div className="admin-product-actions">
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() => {
                        setEditError('');
                        setEditingId(p.id === editingId ? null : p.id);
                      }}
                    >
                      {p.id === editingId ? 'Cerrar' : 'Editar'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() =>
                        toggleFeatured.mutate({
                          id: p.id,
                          featured: !p.featured,
                        })
                      }
                    >
                      {p.featured ? 'Quitar ★' : 'Destacar'}
                    </button>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      onClick={() =>
                        toggleActive.mutate({ id: p.id, active: !p.active })
                      }
                    >
                      {p.active ? 'Ocultar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr>
                <td colSpan={6} className="muted">
                  Todavía no hay productos. Creá el primero arriba.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

export function AdminStockPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get<Product[]>('/products/admin/all')).data,
    staleTime: 20_000,
  });

  const rows = (products ?? []).filter((p) => {
    if (filter === 'low') return p.stock > 0 && p.stock <= 5;
    if (filter === 'out') return p.stock <= 0;
    return true;
  });

  const saveStock = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      await api.patch(`/products/${id}`, { stock });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      invalidateStorefront();
    },
  });

  function draftValue(p: Product) {
    return drafts[p.id] ?? String(p.stock);
  }

  async function commitStock(id: string, next: number) {
    if (!Number.isFinite(next) || next < 0) {
      setError('Stock inválido');
      return;
    }
    setError('');
    setSavingId(id);
    try {
      await saveStock.mutateAsync({ id, stock: Math.floor(next) });
      setDrafts((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo actualizar el stock'));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="stack admin-page-enter">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div>
          <h2>Administrador de stock</h2>
          <p>Ajustá cantidades sin entrar al ABM de publicaciones.</p>
        </div>
        <Link className="btn btn-ghost" to="/admin/productos">
          Ir a publicaciones
        </Link>
      </div>

      <div className="filter-bar">
        <button
          type="button"
          className={`chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button
          type="button"
          className={`chip ${filter === 'low' ? 'active' : ''}`}
          onClick={() => setFilter('low')}
        >
          Stock bajo (≤5)
        </button>
        <button
          type="button"
          className={`chip ${filter === 'out' ? 'active' : ''}`}
          onClick={() => setFilter('out')}
        >
          Sin stock
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="panel" style={{ overflowX: 'auto' }}>
        {isLoading && !products ? (
          <div className="stack">
            <div className="skeleton" style={{ height: 44 }} />
            <div className="skeleton" style={{ height: 44 }} />
            <div className="skeleton" style={{ height: 44 }} />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Img</th>
                <th>Producto</th>
                <th>Estado</th>
                <th>Stock</th>
                <th>Ajuste rápido</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const busy = savingId === p.id;
                const stockClass =
                  p.stock <= 0
                    ? 'stock-out'
                    : p.stock <= 5
                      ? 'stock-low'
                      : 'stock-ok';
                return (
                  <tr key={p.id}>
                    <td>
                      <img
                        src={assetUrl(p.images[0]?.url)}
                        alt={p.name}
                        style={{ width: 48, height: 48, objectFit: 'cover' }}
                      />
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      <span
                        className="muted"
                        style={{ display: 'block', fontSize: '0.78rem' }}
                      >
                        {p.category?.name ?? 'Sin categoría'}
                        {p.active ? '' : ' · Oculto'}
                      </span>
                    </td>
                    <td>
                      <span className={`stock-pill ${stockClass}`}>
                        {p.stock <= 0
                          ? 'Sin stock'
                          : p.stock <= 5
                            ? 'Bajo'
                            : 'OK'}
                      </span>
                    </td>
                    <td>
                      <div className="stock-editor">
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={busy || p.stock <= 0}
                          onClick={() => void commitStock(p.id, p.stock - 1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={draftValue(p)}
                          disabled={busy}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [p.id]: e.target.value,
                            }))
                          }
                          onBlur={() => {
                            const next = Number(draftValue(p));
                            if (next === p.stock) return;
                            void commitStock(p.id, next);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={busy}
                          onClick={() => void commitStock(p.id, p.stock + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="admin-product-actions">
                        {[5, 10, 20].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={busy}
                            onClick={() => void commitStock(p.id, n)}
                          >
                            ={n}
                          </button>
                        ))}
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={busy || p.stock === 0}
                          onClick={() => void commitStock(p.id, 0)}
                        >
                          Agotar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="muted">
                    No hay productos con ese filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export function AdminAccountPage() {
  const { user, refreshMe } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setOk('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('La nueva contraseña no coincide');
      return;
    }
    setPending(true);
    try {
      const payload: {
        currentPassword: string;
        email?: string;
        newPassword?: string;
      } = { currentPassword };
      if (email.trim() && email.trim().toLowerCase() !== user?.email) {
        payload.email = email.trim();
      }
      if (newPassword) payload.newPassword = newPassword;
      await api.patch('/admin/account', payload);
      await refreshMe();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOk(
        'Cuenta actualizada. La contraseña se guarda hasheada (bcrypt) en la DB.',
      );
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = axiosErr.response?.data?.message;
      setError(
        Array.isArray(msg)
          ? msg.join(', ')
          : msg
            ? String(msg)
            : 'No se pudo actualizar',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="stack admin-page-enter">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div>
          <h2>Cuenta admin</h2>
          <p>
            Email y contraseña viven en Supabase (tabla <code>User</code>). La
            pass nunca se guarda en texto plano: solo el hash bcrypt.
          </p>
        </div>
      </div>

      <form className="panel form" onSubmit={(e) => void onSubmit(e)}>
        <label>
          Email de login / OTP
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label>
          Contraseña actual
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="current-password"
          />
        </label>
        <label>
          Nueva contraseña (opcional)
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirmar nueva contraseña
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {ok ? <p className="muted">{ok}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}

