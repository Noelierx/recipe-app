import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { SubRecipe } from '@/types/RecipeTypes';

interface SubRecipeWithRecipe extends SubRecipe {
  recipe_title: string;
  recipe_id: number;
}

export const useExistingSubRecipes = () => {
  const [subRecipes, setSubRecipes] = useState<SubRecipeWithRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExistingSubRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: subRecipesData, error: subRecipesError } = await supabase
        .from('sub_recipes')
        .select(`
          id,
          title,
          instructions,
          recipe_id,
          recipe:recipes (title),
          sub_recipe_ingredients (
            amount,
            unit,
            ingredient:ingredients (id, name)
          )
        `);

      if (subRecipesError) throw new Error(subRecipesError.message);

      const transformedSubRecipes: SubRecipeWithRecipe[] = (subRecipesData ?? []).map((sr: any) => ({
        id: sr.id,
        title: sr.title,
        instructions: sr.instructions,
        recipe_title: sr.recipe?.title ?? 'Unknown Recipe',
        recipe_id: sr.recipe_id,
        ingredients: sr.sub_recipe_ingredients.map((sri: any) => ({
          amount: sri.amount,
          unit: sri.unit,
          ingredient: sri.ingredient
        }))
      }));

      setSubRecipes(transformedSubRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExistingSubRecipes();
  }, [fetchExistingSubRecipes]);

  return { subRecipes, loading, error, refetch: fetchExistingSubRecipes };
};
