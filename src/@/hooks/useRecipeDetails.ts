import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { RecipeWithDetails } from '@/types/types';

export const useRecipeDetails = (recipeId: number) => {
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (recipeError) throw new Error(recipeError.message);
        if (!recipeData) throw new Error('Recipe not found');

        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from('recipe_ingredients')
          .select(`
            amount,
            unit,
            ingredient:ingredients (name)
          `)
          .eq('recipe_id', recipeId);

        if (ingredientsError) throw new Error(ingredientsError.message);

        const { data: tagsData, error: tagsError } = await supabase
          .from('recipe_tags')
          .select(`
            tag:tags (name)
          `)
          .eq('recipe_id', recipeId);

        if (tagsError) throw new Error(tagsError.message);

        const recipeWithDetails: RecipeWithDetails = {
          ...recipeData,
          recipe_ingredients: ingredientsData || [],
          tags: tagsData ? tagsData.map(t => t.tag) : []
        };

        setRecipe(recipeWithDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  return { recipe, loading, error };
};