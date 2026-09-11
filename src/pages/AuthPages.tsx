import { type FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { queryClient } from '../lib/queryClient';

function apiErrorMessage(err: unknown): string {
  const axiosErr = err as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
    code?: string;
  };
  const apiMsg = axiosErr.response?.data?.message;
  if (apiMsg) {
    return Array.isArray(apiMsg) ? apiMsg.join(', ') : String(apiMsg);
  }
  if (
    axiosErr.code === 'ERR_NETWORK' ||
    axiosErr.message?.includes('Network Error')
  ) {
    return 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.';
  }
  return 'No se pudo iniciar sesión';
}

/** Hidden admin-only login — OTP al Gmail Clinch. */
export function AdminLoginPage() {
  const { login, verifyOtp, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [otpHint, setOtpHint] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>();
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void import('../pages/AdminPages');
  }, []);

  async function onPasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await login(
        String(fd.get('email')),
        String(fd.get('password')),
      );
      setChallengeId(result.challengeId);
      setOtpHint(result.otpSentTo);
      setDevCode(result.devCode);
      setNotice(result.notice ?? '');
    } catch (err: unknown) {
      setError(apiErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  async function onOtpSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!challengeId) return;
    setError('');
    setPending(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await verifyOtp(challengeId, String(fd.get('code')).trim());
      if (result.adminBootstrap) {
        queryClient.setQueryData(['admin-bootstrap'], result.adminBootstrap);
      }
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      setError(apiErrorMessage(err));
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

          {!challengeId ? (
            <form className="form" onSubmit={(e) => void onPasswordSubmit(e)}>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                />
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
              <button
                className="btn btn-primary"
                type="submit"
                disabled={pending}
              >
                {pending ? 'Validando...' : 'Continuar'}
              </button>
            </form>
          ) : (
            <form className="form" onSubmit={(e) => void onOtpSubmit(e)}>
              <p className="muted">
                Te enviamos un código de 6 dígitos a{' '}
                <strong>{otpHint || 'el Gmail de Clinch'}</strong>. Revisá la
                bandeja (y spam).
              </p>
              {devCode ? (
                <p className="muted">
                  Código local: <code>{devCode}</code>
                </p>
              ) : null}
              {notice ? <p className="muted">{notice}</p> : null}
              <label>
                Código
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  minLength={6}
                  required
                  autoComplete="one-time-code"
                  placeholder="000000"
                />
              </label>
              {error && <p className="error">{error}</p>}
              <button
                className="btn btn-primary"
                type="submit"
                disabled={pending}
              >
                {pending ? 'Verificando...' : 'Ingresar'}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                disabled={pending}
                onClick={() => {
                  setChallengeId(null);
                  setDevCode(undefined);
                  setError('');
                }}
              >
                Volver
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
