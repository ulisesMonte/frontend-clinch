import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Protected } from './components/Protected';
import { HomePage } from './pages/HomePage';

const CatalogPage = lazy(() =>
  import('./pages/CatalogPage').then((m) => ({ default: m.CatalogPage })),
);
const InfoPage = lazy(() =>
  import('./pages/InfoPage').then((m) => ({ default: m.InfoPage })),
);
const InfoIndexRedirect = lazy(() =>
  import('./pages/InfoPage').then((m) => ({ default: m.InfoIndexRedirect })),
);
const ProductPage = lazy(() =>
  import('./pages/ProductPage').then((m) => ({ default: m.ProductPage })),
);
const AdminLoginPage = lazy(() =>
  import('./pages/AuthPages').then((m) => ({ default: m.AdminLoginPage })),
);
const AdminLayout = lazy(() =>
  import('./pages/AdminPages').then((m) => ({ default: m.AdminLayout })),
);
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminPages').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminProductsPage = lazy(() =>
  import('./pages/AdminPages').then((m) => ({ default: m.AdminProductsPage })),
);
const AdminStockPage = lazy(() =>
  import('./pages/AdminPages').then((m) => ({ default: m.AdminStockPage })),
);
const AdminAccountPage = lazy(() =>
  import('./pages/AdminPages').then((m) => ({ default: m.AdminAccountPage })),
);

function PageLoader() {
  return (
    <div className="container section">
      <p className="muted">Cargando...</p>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="informacion" element={<InfoIndexRedirect />} />
          <Route path="informacion/:slug" element={<InfoPage />} />
          <Route path="producto/:slug" element={<ProductPage />} />
          <Route path="clinch/naz" element={<AdminLoginPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <Protected admin>
              <AdminLayout />
            </Protected>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="stock" element={<AdminStockPage />} />
          <Route path="cuenta" element={<AdminAccountPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
