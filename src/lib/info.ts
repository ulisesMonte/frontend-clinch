export const INFO_SECTIONS = [
  {
    slug: 'quienes-somos',
    title: 'Quiénes somos',
    body: 'Clinch Fight nace del ring: equipamos boxeo y deportes de contacto con productos pensados para entrenar fuerte y competir con confianza. Estamos en Floresta, CABA, y enviamos a todo el país.',
  },
  {
    slug: 'envios',
    title: 'Envíos',
    body: 'Envío a todo el país o retiro en Floresta, CABA.',
  },
  {
    slug: 'garantia',
    title: 'Garantía',
    body: 'Todos nuestros productos tienen garantía ante fallas de fábrica. Si al recibir el pedido detectás un defecto de fabricación, tenés un máximo de 48 horas para iniciar el reclamo por WhatsApp.',
  },
  {
    slug: 'metodos-de-pago',
    title: 'Métodos de pago',
    body: 'Aceptamos todos los métodos de pago: efectivo, Mercado Pago, transferencia bancaria, débito y crédito. Elegí la forma que te resulte más cómoda al momento de comprar.',
  },
  {
    slug: 'guia-talles',
    title: 'Guía de talles',
    body: 'Cuadros de oz para boxeo y MMA: para qué está destinado cada peso de guante y cómo elegir según tu cuerpo o circunferencia de mano.',
  },
  {
    slug: 'guia-uso',
    title: 'Guía de uso',
    body: 'Cómo cuidar guantes de boxeo y MMA: rutina post-entreno, secado, limpieza y errores a evitar para que duren más y no huelan.',
  },
] as const;

export type InfoSlug = (typeof INFO_SECTIONS)[number]['slug'];

export function getInfoSection(slug: string | undefined) {
  return INFO_SECTIONS.find((s) => s.slug === slug) ?? null;
}
