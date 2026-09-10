import { type FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { queryClient } from '../lib/queryClient';

/** Hidden admin-only login — not linked from the storefront. */
export function AdminLoginPage() {
  const { login, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void import('../pages/AdminPages');
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await login(
        String(fd.get('email')),
        String(fd.get('password')),
      );
      if (result.adminBootstrap) {
        queryClient.setQueryData(['admin-bootstrap'], result.adminBootstrap);
      }
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string | string[] }; status?: number };
        message?: string;
        code?: string;
      };
      const apiMsg = axiosErr.response?.data?.message;
      if (apiMsg) {
        setError(Array.isArray(apiMsg) ? apiMsg.join(', ') : String(apiMsg));
      } else if (
        axiosErr.code === 'ERR_NETWORK' ||
        axiosErr.message?.includes('Network Error')
      ) {
        setError(
          'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.',
        );
      } else {
        setError('No se pudo iniciar sesión');
      }
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 480 }}>
          <p className="muted">Cargando...</p>
        </div>
      </section>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="panel stack">
          <h2>Admin</h2>
          <p className="muted">Acceso interno Clinch Fight.</p>
          <form className="form" onSubmit={(e) => void onSubmit(e)}>
            <label>
              Email
              <input name="email" type="email" required autoComplete="username" />
            </label>
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                minLength={8}
                required
                autoComplete="current-password"
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
