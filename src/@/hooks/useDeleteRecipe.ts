import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export const useDeleteRecipe = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteSubRecipeAndIngredients = async (subRecipeId: number): Promise<void> => {
    const { data: subRecipeIngredients, error: subRecipeIngredientsError } = await supabase
      .from('sub_recipe_ingredients')
      .select('ingredient_id')
      .eq('sub_recipe_id', subRecipeId);

    if (subRecipeIngredientsError) throw subRecipeIngredientsError;

    const { error: deleteSubRecipeIngredientsError } = await supabase
      .from('sub_recipe_ingredients')
      .delete()
      .eq('sub_recipe_id', subRecipeId);

    if (deleteSubRecipeIngredientsError) throw deleteSubRecipeIngredientsError;

    for (const { ingredient_id } of subRecipeIngredients) {
      const { error: deleteIngredientError } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', ingredient_id);

      if (deleteIngredientError) throw deleteIngredientError;
    }

    const { error: deleteSubRecipeError } = await supabase
      .from('sub_recipes')
      .delete()
      .eq('id', subRecipeId);

    if (deleteSubRecipeError) throw deleteSubRecipeError;
  };

  const deleteRecipe = async (recipeId: number): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      // Get all sub_recipes for this recipe
      const { data: subRecipes, error: subRecipesError } = await supabase
        .from('sub_recipes')
        .select('id')
        .eq('recipe_id', recipeId);

      if (subRecipesError) throw subRecipesError;

      // Use deleteSubRecipeAndIngredients for each sub-recipe
      for (const { id: subRecipeId } of subRecipes) {
        await deleteSubRecipeAndIngredients(subRecipeId);
      }

      // Delete sub_recipe_ingredients and their corresponding ingredients
      const { data: recipeIngredients, error: recipeIngredientsError } = await supabase
        .from('recipe_ingredients')
        .select('ingredient_id')
        .eq('recipe_id', recipeId);

      if (recipeIngredientsError) throw recipeIngredientsError;

      const { error: deleteRecipeIngredientsError } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', recipeId);

      if (deleteRecipeIngredientsError) throw deleteRecipeIngredientsError;

      for (const { ingredient_id } of recipeIngredients) {
        const { error: deleteIngredientError } = await supabase
          .from('ingredients')
          .delete()
          .eq('id', ingredient_id);

        if (deleteIngredientError) throw deleteIngredientError;
      }

      // Get and delete recipe_tags, then delete unused tags
      const { data: recipeTags, error: recipeTagsError } = await supabase
        .from('recipe_tags')
        .select('tag_id')
        .eq('recipe_id', recipeId);

      if (recipeTagsError) throw recipeTagsError;

      const { error: deleteRecipeTagsError } = await supabase
        .from('recipe_tags')
        .delete()
        .eq('recipe_id', recipeId);

      if (deleteRecipeTagsError) throw deleteRecipeTagsError;

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

      // Delete the main recipe
      const { error: deleteRecipeError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (deleteRecipeError) throw deleteRecipeError;

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

  const deleteSubRecipe = async (subRecipeId: number): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteSubRecipeAndIngredients(subRecipeId);
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

  return { deleteRecipe, deleteSubRecipe, isDeleting, error };
};