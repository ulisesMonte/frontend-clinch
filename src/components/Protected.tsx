import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { ReactNode } from 'react';

export function Protected({
  children,
  admin,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    if (admin) {
      return (
        <div className="container admin-layout">
          <aside className="admin-side">
            <div className="skeleton" style={{ height: 28, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 18 }} />
          </aside>
          <div className="stack">
            <div className="skeleton" style={{ height: 48 }} />
            <div className="stats">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 88 }} />
              ))}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="container section">
        <p className="muted">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={admin ? '/clinch/naz' : '/'}
        replace
        state={admin ? { from: location.pathname } : undefined}
      />
    );
  }

  if (admin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
