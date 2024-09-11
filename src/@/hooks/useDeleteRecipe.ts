import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export const useDeleteRecipe = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRecipe = async (recipeId: number): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const { data: recipeIngredients, error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .select('ingredient_id')
        .eq('recipe_id', recipeId);

      if (ingredientsError) throw ingredientsError;

      const { error: recipeIngredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId);

      if (recipeIngredientsError) throw recipeIngredientsError;

      for (const { ingredient_id } of recipeIngredients) {
        const { error: deleteIngredientError } = await supabase
          .from('ingredients')
          .delete()
          .eq('id', ingredient_id);

        if (deleteIngredientError) throw deleteIngredientError;
      }

      const { data: recipeTags, error: tagsError } = await supabase
        .from('recipe_tags')
        .select('tag_id')
        .eq('recipe_id', recipeId);

      if (tagsError) throw tagsError;

      const { error: recipeTagsError } = await supabase
        .from('recipe_tags')
        .delete()
        .eq('recipe_id', recipeId);

      if (recipeTagsError) throw recipeTagsError;

      for (const { tag_id } of recipeTags) {
        const { count, error: countError } = await supabase
          .from('recipe_tags')
          .select('*', { count: 'exact', head: true })
          .eq('tag_id', tag_id);

        if (countError) throw countError;

        if (count === 0) {
          const { error: deleteTagError } = await supabase
            .from('tags')
            .delete()
            .eq('id', tag_id);

          if (deleteTagError) throw deleteTagError;
        }
      }

      const { error: recipeError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (recipeError) throw recipeError;

      return true;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteRecipe, isDeleting, error };
};