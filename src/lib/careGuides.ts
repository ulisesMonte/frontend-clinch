export type CareStep = {
  title: string;
  detail: string;
};

export type CareDoDont = {
  do: string;
  avoid: string;
};

/** Rutina post-entreno (boxeo y MMA) */
export const CARE_AFTER_TRAINING: CareStep[] = [
  {
    title: 'Sacá las vendas ya',
    detail:
      'Las vendas absorben el sudor. Si las dejás adentro, humedecen el forro y aceleran el olor.',
  },
  {
    title: 'Secá por fuera y por dentro',
    detail:
      'Con un paño seco o microfibra, limpiá el exterior y el borde interno (palma, dedos y pulgar) para sacar sudor y sal.',
  },
  {
    title: 'Abrí la muñeca al máximo',
    detail:
      'Dejá el velcro / cierre bien abierto para que circule aire dentro del guante. No lo dejes aplastado.',
  },
  {
    title: 'Nunca al bolso cerrado',
    detail:
      'Sacá los guantes del bolso apenas terminás. Un bolso cerrado + calor = bacterias y mal olor.',
  },
];

/** Secado y guardado */
export const CARE_DRYING: CareStep[] = [
  {
    title: 'Aireá a temperatura ambiente',
    detail:
      'Colocalos en un lugar fresco, seco y ventilado. Un ventilador a distancia ayuda; el calor directo no.',
  },
  {
    title: 'Absorbentes (opcional)',
    detail:
      'Cuando ya están medio secos, podés poner “glove dogs”, carbón activado o una bolsita con bicarbonato para sacar humedad residual.',
  },
  {
    title: 'Guardá solo cuando estén secos',
    detail:
      'Usá una bolsa de malla o un lugar abierto. No apiles peso encima: comprime el foam y deforma el guante.',
  },
  {
    title: 'Rotá el par si entrenás todos los días',
    detail:
      'Dos pares permiten que cada uno seque 24 hs. Entre sesiones, apuntá a 8–12 hs de aireado mínimo.',
  },
];

/** Limpieza periódica */
export const CARE_CLEANING: CareStep[] = [
  {
    title: 'Limpieza suave del exterior',
    detail:
      'Paño apenas húmedo con jabón neutro. Enjuagá el paño y secá. No empapes costuras ni foam.',
  },
  {
    title: 'Interior sin inundar',
    detail:
      'Secá primero. Si hace falta, pasá un paño con alcohol isopropílico 70% diluido en el forro accesible. Secá completo después.',
  },
  {
    title: 'Vendas siempre lavadas',
    detail:
      'Lavá las vendas después de cada uso. Guantes limpios + vendas sucias = el olor vuelve igual.',
  },
];

/** Qué sí / qué no */
export const CARE_DO_DONT: CareDoDont[] = [
  {
    do: 'Usar vendas limpias en cada sesión',
    avoid: 'Entrenar sin vendas (más sudor directo al forro)',
  },
  {
    do: 'Airear abiertos en lugar ventilado',
    avoid: 'Secar con secador, radiador, auto al sol o calor directo',
  },
  {
    do: 'Limpiar con paño húmedo y poco jabón',
    avoid: 'Lavar en lavarropas, remojar o meter en secarropas',
  },
  {
    do: 'Transportar en bolsa de malla si están secos',
    avoid: 'Dejarlos días en bolso cerrado o bolsa de plástico',
  },
  {
    do: 'Revisar costuras y foam con regularidad',
    avoid: 'Seguir usando guantes con olor a moho o forro destruido',
  },
];

/** Tips extras MMA vs boxeo */
export const CARE_BY_TYPE: CareStep[] = [
  {
    title: 'Guantes de boxeo',
    detail:
      'El forro cerrado retiene más humedad: priorizá abrir la muñeca y airear bien. El oz (12–16 etc.) no cambia el cuidado; sí importa no comprimir el padding al guardar.',
  },
  {
    title: 'Guantes de MMA',
    detail:
      'Al ser abiertos, secan un poco más fácil, pero el sudor queda en nudillos y dedos. Limpiá bien la zona de agarre y el velcro; no satures el foam del golpe.',
  },
];
