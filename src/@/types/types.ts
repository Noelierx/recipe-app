export interface Recipe {
  id: number;
  title: string;
  instructions: string;
  servings: number;
}

export interface Ingredient {
  amount: number;
  unit: string;
  id: number;
  name: string;
}

export interface RecipeIngredient {
  amount: number;
  unit: string;
  ingredient: Ingredient;
}

export interface Tag {
  id?: number;
  name: string;
}

export interface RecipeWithDetails extends Recipe {
  recipe_ingredients: RecipeIngredient[];
  tags: Tag[];
}

export interface RecipeWithTags extends Recipe {
  tags: Tag[];
}