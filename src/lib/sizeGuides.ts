export type SizeRow = {
  oz: string;
  use: string;
  notes?: string;
};

export type WeightGuideRow = {
  weight: string;
  bag: string;
  sparring: string;
  competition: string;
};

export type HandSizeRow = {
  size: string;
  circumference: string;
  typicalOz: string;
};

/** Oz → uso típico (guantes de boxeo) */
export const BOXING_OZ_GUIDE: SizeRow[] = [
  {
    oz: '8 oz',
    use: 'Competencia (pro / amateurs livianos)',
    notes: 'Poco padding, máxima velocidad. No ideal para sparring diario.',
  },
  {
    oz: '10 oz',
    use: 'Competencia amateur y trabajo de velocidad',
    notes: 'También bags/pads en personas livianas.',
  },
  {
    oz: '12 oz',
    use: 'Bolsa, pads y boxing fitness',
    notes: 'Buen equilibrio protección / velocidad para entrenar.',
  },
  {
    oz: '14 oz',
    use: 'Entrenamiento general y sparring liviano',
    notes: 'Versátil; muchos gyms lo aceptan en sparring controlado.',
  },
  {
    oz: '16 oz',
    use: 'Sparring estándar (adultos)',
    notes: 'El más pedido en gyms: protege a vos y al compañero.',
  },
  {
    oz: '18–20 oz',
    use: 'Sparring pesado / máxima protección',
    notes: 'Ideal para pesos altos o sesiones con mucho impacto.',
  },
];

/** Guía por peso corporal — boxeo */
export const BOXING_BY_WEIGHT: WeightGuideRow[] = [
  {
    weight: 'Hasta 50 kg',
    bag: '8–10 oz',
    sparring: '12–14 oz',
    competition: '8–10 oz',
  },
  {
    weight: '50–60 kg',
    bag: '10–12 oz',
    sparring: '14 oz',
    competition: '10 oz',
  },
  {
    weight: '60–70 kg',
    bag: '10–12 oz',
    sparring: '14–16 oz',
    competition: '10 oz',
  },
  {
    weight: '70–80 kg',
    bag: '12–14 oz',
    sparring: '16 oz',
    competition: '10 oz',
  },
  {
    weight: '80–90 kg',
    bag: '14 oz',
    sparring: '16 oz',
    competition: '10–12 oz',
  },
  {
    weight: '90–100 kg',
    bag: '14–16 oz',
    sparring: '16–18 oz',
    competition: '10–12 oz',
  },
  {
    weight: 'Más de 100 kg',
    bag: '16 oz',
    sparring: '18–20 oz',
    competition: '12 oz',
  },
];

/** Oz → uso típico (guantes MMA) */
export const MMA_OZ_GUIDE: SizeRow[] = [
  {
    oz: '4 oz',
    use: 'Competencia profesional',
    notes: 'Estándar tipo UFC. Mínimo padding, máxima movilidad de dedos.',
  },
  {
    oz: '6 oz',
    use: 'Competencia amateur y entrenamiento técnico',
    notes: 'Buen equilibrio para drills, pads y sparring moderado.',
  },
  {
    oz: '7 oz',
    use: 'Sparring MMA (recomendado)',
    notes: 'Más padding en nudillos; lo pide la mayoría de los gyms.',
  },
  {
    oz: '8 oz',
    use: 'Sparring con más protección',
    notes: 'Útil si pegás fuerte o querés cuidar manos y compañero.',
  },
];

/** Talle por circunferencia de mano — MMA (S/M/L/XL) */
export const MMA_HAND_SIZES: HandSizeRow[] = [
  {
    size: 'S',
    circumference: '16–18 cm (≈ 6.5–7.5″)',
    typicalOz: '4–6 oz',
  },
  {
    size: 'M',
    circumference: '18–21 cm (≈ 7.5–8.3″)',
    typicalOz: '6–7 oz',
  },
  {
    size: 'L',
    circumference: '21–23 cm (≈ 8.3–9.1″)',
    typicalOz: '7 oz',
  },
  {
    size: 'XL',
    circumference: '23–25 cm (≈ 9.1–9.8″)',
    typicalOz: '7–8 oz',
  },
];
