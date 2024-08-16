export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
  }
  
  export interface Recipe {
    id: number;
    title: string;
    ingredients: Ingredient[];
    instructions: string;
    servings: number;
    tags: string[];
  }