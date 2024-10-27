export interface Recipe {
  id: number;
  title: string;
  instructions: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
}

export interface Ingredient {
  amount: number;
  unit: string;
  id?: number;
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

export interface SubRecipe {
  id?: number;
  title: string;
  instructions: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeWithDetails extends Recipe {
  sub_recipes: SubRecipe[];
  main_instructions?: string;
  recipe_ingredients: RecipeIngredient[];
  tags: Tag[];
}

export interface RecipeWithTags extends Recipe {
  tags: Tag[];
}
