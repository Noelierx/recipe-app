export const allowedUnits = [
    'g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'oz', 'lb', 
    'botte', 'feuille', 'gousse', 'pincée', 'tranche', 'unité'
  ];

  export type Unit = typeof allowedUnits[number];