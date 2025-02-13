import { Unit } from '@/constants';

const conversions: Partial<Record<Unit, { factor: number, newUnit: Unit }>> = {
  g: { factor: 1000, newUnit: 'kg' },
  kg: { factor: 1 / 1000, newUnit: 'g' },
  ml: { factor: 1000, newUnit: 'l' },
  l: { factor: 1 / 1000, newUnit: 'ml' },
  tsp: { factor: 3, newUnit: 'tbsp' },
  tbsp: { factor: 16, newUnit: 'cup' },
};

export const convertUnit = (amount: number, unit: Unit): { amount: number, unit: Unit } => {
  const conversion = conversions[unit];
  if (conversion) {
    const { factor, newUnit } = conversion;
    if (amount >= factor) {
      return { amount: amount / factor, unit: newUnit };
    }
  }

  return { amount, unit };
};