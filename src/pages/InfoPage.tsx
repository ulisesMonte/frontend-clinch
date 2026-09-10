import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  CARE_AFTER_TRAINING,
  CARE_BY_TYPE,
  CARE_CLEANING,
  CARE_DO_DONT,
  CARE_DRYING,
} from '../lib/careGuides';
import { INFO_SECTIONS, getInfoSection } from '../lib/info';
import {
  BOXING_BY_WEIGHT,
  BOXING_OZ_GUIDE,
  MMA_HAND_SIZES,
  MMA_OZ_GUIDE,
} from '../lib/sizeGuides';

export function InfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const section = getInfoSection(slug);
  const isSizeGuide = slug === 'guia-talles';
  const isCareGuide = slug === 'guia-uso';
  const isPaymentMethods = slug === 'metodos-de-pago';
  const isShipping = slug === 'envios';
  const isWarranty = slug === 'garantia';
  const isAbout = slug === 'quienes-somos';
  const isWide = isSizeGuide || isCareGuide;
  const theme = isWide ? 'guides' : isAbout ? 'about' : 'info';
  const bgSrc =
    theme === 'guides'
      ? '/hero/spar.jpg'
      : theme === 'about'
        ? '/hero/about.jpg'
        : '/hero/ring.jpg';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  if (slug === 'devoluciones') {
    return <Navigate to="/informacion/garantia" replace />;
  }

  if (!slug || !section) {
    return <Navigate to="/informacion/quienes-somos" replace />;
  }

  const index = INFO_SECTIONS.findIndex((s) => s.slug === section.slug);
  const prev = index > 0 ? INFO_SECTIONS[index - 1] : null;
  const next =
    index >= 0 && index < INFO_SECTIONS.length - 1
      ? INFO_SECTIONS[index + 1]
      : null;

  const intro = isSizeGuide
    ? 'Los guantes se miden en onzas (oz): más oz = más padding y protección, menos velocidad. Abajo tenés la referencia para boxeo y MMA. Si dudás entre dos talles, mirá la guía o entrá al producto y consultanos desde ahí.'
    : isCareGuide
      ? 'El sudor y la humedad son el enemigo del guante. Con una rutina simple después de cada sesión vas a alargar la vida del foam, evitar bacterias y cortar el mal olor. Sirve para boxeo y MMA.'
      : section.body;

  return (
    <div className={`info-page info-theme-${theme}${isWide ? ' info-page-wide' : ''}`}>
      <div className="info-page-media" aria-hidden="true">
        <img
          className="info-page-photo"
          src={bgSrc}
          alt=""
          decoding="async"
        />
      </div>
      <div className="info-page-watermark" aria-hidden="true" />
      <div className="info-page-glow" aria-hidden="true" />
      <div className="info-page-veil" aria-hidden="true" />

      <div
        className={`container info-page-content ${isWide ? 'info-page-wide-frame' : 'info-page-frame'}`}
      >
        <article className="info-sheet" key={section.slug}>
          <p className="info-kicker">Información</p>
          <h1>{section.title}</h1>
          {isShipping ? (
            <p className="info-lead">Modalidades de entrega</p>
          ) : isWarranty ? (
            <p className="info-lead">Cobertura y reclamo</p>
          ) : (
            <p className="info-body">{intro}</p>
          )}

          {isSizeGuide ? <SizeGuideContent /> : null}
          {isCareGuide ? <CareGuideContent /> : null}
          {isPaymentMethods ? <PaymentMethodsContent /> : null}
          {isShipping ? <ShippingContent /> : null}
          {isWarranty ? <WarrantyContent /> : null}
        </article>

        {!isAbout ? (
          <nav className="info-pager" aria-label="Otras secciones">
            {prev ? (
              <Link to={`/informacion/${prev.slug}`} className="info-pager-link">
                <span>Anterior</span>
                <strong>{prev.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/informacion/${next.slug}`}
                className="info-pager-link info-pager-next"
              >
                <span>Siguiente</span>
                <strong>{next.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </div>
  );
}

function ShippingContent() {
  return (
    <div className="shipping-split">
      <article className="shipping-option">
        <span className="shipping-option-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M3 6.5h11.5V15H3zm12.5 3H21l2 3.5V15h-7.5zM6.25 18.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5m11.5 0a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5"
            />
          </svg>
        </span>
        <h2>A domicilio</h2>
        <p className="shipping-option-copy">Envíos a todo el país</p>
        <ul className="shipping-facts">
          <li>Con número de seguimiento</li>
          <li>Coordinación al confirmar el pedido</li>
        </ul>
      </article>

      <div className="shipping-or" aria-hidden>
        <span>o</span>
      </div>

      <article className="shipping-option">
        <span className="shipping-option-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M12 2.75a6.5 6.5 0 0 0-6.5 6.5c0 4.55 6.5 11.5 6.5 11.5s6.5-6.95 6.5-11.5A6.5 6.5 0 0 0 12 2.75m0 8.75a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5"
            />
          </svg>
        </span>
        <h2>Retiro</h2>
        <p className="shipping-option-copy">Punto de encuentro en Floresta</p>
        <ul className="shipping-facts">
          <li>Capital Federal</li>
          <li>Día y horario coordinados</li>
        </ul>
      </article>
    </div>
  );
}

function PaymentMethodsContent() {
  const methods = [
    'Efectivo',
    'Mercado Pago',
    'Transferencia bancaria',
    'Tarjeta de débito',
    'Tarjeta de crédito',
  ];

  return (
    <ul className="payment-methods-list">
      {methods.map((method) => (
        <li key={method}>{method}</li>
      ))}
    </ul>
  );
}

function WarrantyContent() {
  return (
    <div className="shipping-split">
      <article className="shipping-option">
        <span className="shipping-option-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M12 2.75 4 6.25v5.25c0 4.7 3.25 9.05 8 10.1 4.75-1.05 8-5.4 8-10.1V6.25zm-1 12.1-3.1-3.1 1.4-1.4 1.7 1.7 3.7-3.7 1.4 1.4z"
            />
          </svg>
        </span>
        <h2>Cobertura</h2>
        <p className="shipping-option-copy">Fallas de fábrica</p>
        <ul className="shipping-facts">
          <li>Defectos de fabricación</li>
          <li>Al recibir el pedido</li>
        </ul>
      </article>

      <div className="shipping-or" aria-hidden>
        <span>+</span>
      </div>

      <article className="shipping-option">
        <span className="shipping-option-icon" aria-hidden>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.51 8.51 0 0 0 12 3.5m0 15a6.5 6.5 0 1 1 6.5-6.5 6.51 6.51 0 0 1-6.5 6.5m.75-10.25h-1.5v5.5l4.75 2.85.75-1.25-4-2.4z"
            />
          </svg>
        </span>
        <h2>Reclamo</h2>
        <p className="shipping-option-copy">Máximo 48 horas</p>
        <ul className="shipping-facts">
          <li>Desde la recepción</li>
          <li>Gestión por WhatsApp</li>
        </ul>
      </article>
    </div>
  );
}

function CareGuideContent() {
  return (
    <div className="size-guide">
      <section className="size-guide-block">
        <h2>Después de entrenar</h2>
        <p className="size-guide-note">
          Lo más importante: sacar la humedad lo antes posible.
        </p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Paso</th>
                <th scope="col">Qué hacer</th>
              </tr>
            </thead>
            <tbody>
              {CARE_AFTER_TRAINING.map((row) => (
                <tr key={row.title}>
                  <td className="size-oz">{row.title}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="size-guide-block">
        <h2>Secado y guardado</h2>
        <p className="size-guide-note">
          Secar bien vale más que cualquier perfume o spray.
        </p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Tema</th>
                <th scope="col">Recomendación</th>
              </tr>
            </thead>
            <tbody>
              {CARE_DRYING.map((row) => (
                <tr key={row.title}>
                  <td className="size-oz">{row.title}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="size-guide-block">
        <h2>Limpieza</h2>
        <p className="size-guide-note">
          Limpieza puntual, sin remojar el foam.
        </p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Qué</th>
                <th scope="col">Cómo</th>
              </tr>
            </thead>
            <tbody>
              {CARE_CLEANING.map((row) => (
                <tr key={row.title}>
                  <td className="size-oz">{row.title}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="size-guide-block">
        <h2>Hacé esto / evitá esto</h2>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Recomendado</th>
                <th scope="col">Evitar</th>
              </tr>
            </thead>
            <tbody>
              {CARE_DO_DONT.map((row) => (
                <tr key={row.do}>
                  <td>{row.do}</td>
                  <td className="muted">{row.avoid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="size-guide-block">
        <h2>Boxeo y MMA</h2>
        <p className="size-guide-note">
          Misma lógica de humedad; cambia un poco el diseño del guante.
        </p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Tipo</th>
                <th scope="col">Tip</th>
              </tr>
            </thead>
            <tbody>
              {CARE_BY_TYPE.map((row) => (
                <tr key={row.title}>
                  <td className="size-oz">{row.title}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SizeGuideContent() {
  return (
    <div className="size-guide">
      <section className="size-guide-block">
        <h2>Boxeo — oz y para qué sirven</h2>
        <p className="size-guide-note">
          En boxeo el número en oz indica el peso/padding del guante, no el
          talle de la mano.
        </p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Oz</th>
                <th scope="col">Destinado a</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {BOXING_OZ_GUIDE.map((row) => (
                <tr key={row.oz}>
                  <td className="size-oz">{row.oz}</td>
                  <td>{row.use}</td>
                  <td className="muted">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="size-guide-block">
        <h2>Boxeo — según tu peso</h2>
        <p className="size-guide-note">
          Referencia general. En muchos gyms el sparring adulto se hace sí o sí
          en 16 oz.
        </p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Peso corporal</th>
                <th scope="col">Bolsa / pads</th>
                <th scope="col">Sparring</th>
                <th scope="col">Competencia</th>
              </tr>
            </thead>
            <tbody>
              {BOXING_BY_WEIGHT.map((row) => (
                <tr key={row.weight}>
                  <td>{row.weight}</td>
                  <td className="size-oz">{row.bag}</td>
                  <td className="size-oz">{row.sparring}</td>
                  <td className="size-oz">{row.competition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="size-guide-block">
        <h2>MMA — oz y para qué sirven</h2>
        <p className="size-guide-note">
          En MMA las oz marcan el padding; el ajuste de la mano suele ir por
          talle S / M / L / XL.
        </p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Oz</th>
                <th scope="col">Destinado a</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {MMA_OZ_GUIDE.map((row) => (
                <tr key={row.oz}>
                  <td className="size-oz">{row.oz}</td>
                  <td>{row.use}</td>
                  <td className="muted">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="size-guide-block">
        <h2>MMA — talle por circunferencia de mano</h2>
        <p className="size-guide-note">
          Medí la mano dominante alrededor de los nudillos (sin el pulgar). Si
          usás vendas, considerá subir medio talle.
        </p>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th scope="col">Talle</th>
                <th scope="col">Circunferencia</th>
                <th scope="col">Oz típicas</th>
              </tr>
            </thead>
            <tbody>
              {MMA_HAND_SIZES.map((row) => (
                <tr key={row.size}>
                  <td className="size-oz">{row.size}</td>
                  <td>{row.circumference}</td>
                  <td className="size-oz">{row.typicalOz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function InfoIndexRedirect() {
  return <Navigate to="/informacion/quienes-somos" replace />;
}
