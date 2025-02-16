import { Unit } from '@/constants';

const conversions: Partial<Record<Unit, { factor: number, newUnit: Unit }>> = {
  g: { factor: 1000, newUnit: 'kg' },
  kg: { factor: 1 / 1000, newUnit: 'g' },
  ml: { factor: 100, newUnit: 'cl' },
  cl: { factor: 10, newUnit: 'l' },
  tsp: { factor: 3, newUnit: 'tbsp' },
  tbsp: { factor: 16, newUnit: 'cup' },
  cup: { factor: 1 / 16, newUnit: 'tbsp' },
  oz: { factor: 28.3495, newUnit: 'g' },
  lb: { factor: 453.592, newUnit: 'g' },
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