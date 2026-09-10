/** WhatsApp Business Clinch Fight — E.164 without + */
const DEFAULT_WHATSAPP = '5491131604552';

export function whatsappNumber() {
  const fromEnv = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
  return (fromEnv || DEFAULT_WHATSAPP).replace(/\D/g, '');
}

export function whatsappConsultUrl(opts: {
  productName: string;
  productUrl?: string;
}) {
  const lines = [
    `Hola! Quiero consultar por: ${opts.productName}`,
    opts.productUrl ? opts.productUrl : null,
  ].filter(Boolean);
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${whatsappNumber()}?text=${text}`;
}
