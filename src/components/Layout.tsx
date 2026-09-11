import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { INFO_SECTIONS } from '../lib/info';
import { storefrontQueryOptions } from '../lib/storefront';
import { scrollToSection } from '../lib/scroll';

const INFO_MENU = INFO_SECTIONS.filter((s) =>
  ['envios', 'garantia', 'metodos-de-pago'].includes(s.slug),
);

const GUIDES_MENU = INFO_SECTIONS.filter((s) =>
  ['guia-talles', 'guia-uso'].includes(s.slug),
);

type OpenMenu = 'catalog' | 'info' | 'guides' | null;

function isDesktopNav() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 901px)').matches;
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const storefront = useQuery(storefrontQueryOptions());
  const categories = (storefront.data?.categories ?? []).filter(
    (c) => !c.parentId,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const navId = useId();
  const closeTimerRef = useRef<number | null>(null);

  const catalogMenuActive =
    location.pathname === '/catalogo' ||
    location.pathname.startsWith('/producto/');
  const infoMenuActive = INFO_MENU.some(
    (s) => location.pathname === `/informacion/${s.slug}`,
  );
  const guidesMenuActive = GUIDES_MENU.some(
    (s) => location.pathname === `/informacion/${s.slug}`,
  );

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.toggle('nav-locked', mobileOpen);
    return () => document.body.classList.remove('nav-locked');
  }, [mobileOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  function clearCloseTimer() {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function closeAllMenus() {
    clearCloseTimer();
    setOpenMenu(null);
  }

  /** Desktop: open exactly one menu (replaces any other instantly). */
  function openDesktopMenu(key: OpenMenu) {
    if (!isDesktopNav() || !key) return;
    clearCloseTimer();
    setOpenMenu(key);
  }

  /** Desktop: close only if this menu is still the active one. */
  function scheduleCloseDesktopMenu(key: OpenMenu) {
    if (!isDesktopNav() || !key) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenMenu((current) => (current === key ? null : current));
      closeTimerRef.current = null;
    }, 100);
  }

  function onMenuTriggerClick(key: OpenMenu) {
    // Desktop uses hover; mobile uses click/tap.
    if (isDesktopNav() || !key) return;
    setOpenMenu((current) => (current === key ? null : key));
  }

  function goHomeSection(id: string) {
    closeAllMenus();
    setMobileOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    scrollToSection(id);
    navigate(`/#${id}`, { replace: true });
  }

  function goCatalog(categorySlug?: string) {
    closeAllMenus();
    setMobileOpen(false);
    if (categorySlug) {
      navigate(`/catalogo?category=${encodeURIComponent(categorySlug)}`);
      return;
    }
    navigate('/catalogo');
  }


  return (
    <>
      <header className="site-header">
        <div className="container header-bar">
          <button
            type="button"
            className={`nav-toggle${mobileOpen ? ' is-open' : ''}`}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            aria-controls={navId}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav
            id={navId}
            className={`main-nav${mobileOpen ? ' is-open' : ''}`}
            aria-label="Principal"
          >
            <div
              className={`nav-item${openMenu === 'catalog' ? ' is-open' : ''}`}
              onMouseEnter={() => openDesktopMenu('catalog')}
              onMouseLeave={() => scheduleCloseDesktopMenu('catalog')}
            >
              <button
                type="button"
                className={`nav-trigger${catalogMenuActive ? ' is-active' : ''}`}
                aria-haspopup="true"
                aria-expanded={openMenu === 'catalog'}
                onClick={() => goCatalog()}
              >
                Catálogo
              </button>
              <ul className="nav-dropdown" role="menu">
                {categories.length ? (
                  categories.map((cat) => (
                    <li key={cat.id} role="none">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => goCatalog(cat.slug)}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="nav-dropdown-empty" role="none">
                    Sin categorías aún
                  </li>
                )}
              </ul>
            </div>

            <div
              className={`nav-item${openMenu === 'info' ? ' is-open' : ''}`}
              onMouseEnter={() => openDesktopMenu('info')}
              onMouseLeave={() => scheduleCloseDesktopMenu('info')}
            >
              <button
                type="button"
                className={`nav-trigger${infoMenuActive ? ' is-active' : ''}`}
                aria-haspopup="true"
                aria-expanded={openMenu === 'info'}
                onClick={() => onMenuTriggerClick('info')}
              >
                Información
              </button>
              <ul className="nav-dropdown" role="menu">
                {INFO_MENU.map((link) => (
                  <li
                    key={link.slug}
                    role="none"
                    className={
                      link.slug === 'envios' ? 'nav-dropdown-flyout' : undefined
                    }
                  >
                    <NavLink
                      to={`/informacion/${link.slug}`}
                      role="menuitem"
                      className={({ isActive }) =>
                        `nav-dropdown-link${isActive ? ' is-active' : ''}`
                      }
                    >
                      {link.title}
                    </NavLink>
                    {link.slug === 'envios' ? (
                      <div className="nav-submenu" role="note">
                        Información de envíos: a todo el país o retiro en
                        Floresta.
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={`nav-item${openMenu === 'guides' ? ' is-open' : ''}`}
              onMouseEnter={() => openDesktopMenu('guides')}
              onMouseLeave={() => scheduleCloseDesktopMenu('guides')}
            >
              <button
                type="button"
                className={`nav-trigger${guidesMenuActive ? ' is-active' : ''}`}
                aria-haspopup="true"
                aria-expanded={openMenu === 'guides'}
                onClick={() => onMenuTriggerClick('guides')}
              >
                Guías
              </button>
              <ul className="nav-dropdown" role="menu">
                {GUIDES_MENU.map((link) => (
                  <li key={link.slug} role="none">
                    <NavLink
                      to={`/informacion/${link.slug}`}
                      role="menuitem"
                      className={({ isActive }) =>
                        `nav-dropdown-link${isActive ? ' is-active' : ''}`
                      }
                    >
                      {link.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <NavLink
              to="/informacion/quienes-somos"
              className={({ isActive }) =>
                `nav-link${isActive ? ' is-active' : ''}`
              }
              onMouseEnter={closeAllMenus}
            >
              Quiénes somos
            </NavLink>
          </nav>

          <Link to="/" className="header-brand" aria-label="Clinch Fight">
            <img src="/logo.png" alt="" />
            <span>CLINCH</span>
          </Link>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon"
              aria-label="Carrito"
              title="Carrito (próximamente)"
              onClick={() => goHomeSection('ofertas')}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                <path
                  fill="currentColor"
                  d="M7 18a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm10 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2zM7.2 14h9.45a1 1 0 0 0 .96-.74L20 5H6.2L5.3 2H2v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 8 16h12v-2H8z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Cerrar menú"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <span className="footer-brand">CLINCH FIGHT</span>
            <p className="muted">
              Equipamiento para boxeo y deportes de contacto. Envíos a todo el
              país. Retiro en Floresta.
            </p>
          </div>
          <div className="footer-cols">
            <div>
              <strong>Tienda</strong>
              <button
                type="button"
                className="footer-link"
                onClick={() => goHomeSection('ofertas')}
              >
                Ofertas
              </button>
              <button
                type="button"
                className="footer-link"
                onClick={() => goHomeSection('destacados')}
              >
                Destacados
              </button>
              <Link to="/catalogo">Catálogo completo</Link>
              <Link to="/informacion/envios">Información</Link>
              <Link to="/informacion/quienes-somos">Quiénes somos</Link>
            </div>
            <div>
              <strong>Contacto</strong>
              <span className="muted">@clinchfight</span>
              <span className="muted">Floresta, CABA</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
