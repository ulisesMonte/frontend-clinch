import { formatMoney } from './api';

/** True when compareAtPrice is set and higher than the sale price. */
export function hasOffer(
  price: number | string,
  compareAtPrice?: number | string | null,
) {
  if (compareAtPrice == null || compareAtPrice === '') return false;
  return Number(compareAtPrice) > Number(price);
}

export function offerLabel(
  price: number | string,
  compareAtPrice?: number | string | null,
) {
  if (!hasOffer(price, compareAtPrice)) return null;
  const pct = Math.round(
    (1 - Number(price) / Number(compareAtPrice)) * 100,
  );
  return pct > 0 ? `-${pct}%` : 'Oferta';
}

type PriceBlockProps = {
  price: number | string;
  compareAtPrice?: number | string | null;
  size?: 'sm' | 'lg';
};

export function PriceBlock({
  price,
  compareAtPrice,
  size = 'sm',
}: PriceBlockProps) {
  const onSale = hasOffer(price, compareAtPrice);
  const label = offerLabel(price, compareAtPrice);

  return (
    <div
      className={`price-block ${size === 'lg' ? 'price-block-lg' : ''}`}
    >
      {onSale && (
        <span className="price-compare">{formatMoney(compareAtPrice!)}</span>
      )}
      <span className="price">{formatMoney(price)}</span>
      {label && <span className="price-badge">{label}</span>}
    </div>
  );
}
