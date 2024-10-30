import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';

export const useDeleteRecipe = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteIngredient = async (ingredientId: number): Promise<void> => {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', ingredientId);
    if (error) throw error;
  };

  const deleteSubRecipe = async (subRecipeId: number): Promise<void> => {
    const { data: subRecipeIngredients, error: subRecipeIngredientsError } = await supabase
      .from('sub_recipe_ingredients')
      .select('ingredient_id')
      .eq('sub_recipe_id', subRecipeId);
    if (subRecipeIngredientsError) throw subRecipeIngredientsError;

    await supabase
      .from('sub_recipe_ingredients')
      .delete()
      .eq('sub_recipe_id', subRecipeId);

    for (const { ingredient_id } of subRecipeIngredients) {
      await Promise.all(
        subRecipeIngredients.map(({ ingredient_id }) => deleteIngredient(ingredient_id))
      );
    }

    const { error: deleteSubRecipeError } = await supabase
      .from('sub_recipes')
      .delete()
      .eq('id', subRecipeId);
    if (deleteSubRecipeError) throw deleteSubRecipeError;
  };

  const deleteRecipeIngredients = async (recipeId: number): Promise<void> => {
    const { data: recipeIngredients, error: recipeIngredientsError } = await supabase
      .from('recipe_ingredients')
      .select('ingredient_id')
      .eq('recipe_id', recipeId);
    if (recipeIngredientsError) throw recipeIngredientsError;

    await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', recipeId);

    await Promise.all(
      recipeIngredients.map(({ ingredient_id }) => deleteIngredient(ingredient_id))
    );
  };

  const deleteTags = async (recipeId: number): Promise<void> => {
    const { data: recipeTags, error: recipeTagsError } = await supabase
      .from('recipe_tags')
      .select('tag_id')
      .eq('recipe_id', recipeId);
    if (recipeTagsError) throw recipeTagsError;

    await supabase
      .from('recipe_tags')
      .delete()
      .eq('recipe_id', recipeId);

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
  };

  const deleteRecipe = async (recipeId: number): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const { data: subRecipes, error: subRecipesError } = await supabase
        .from('sub_recipes')
        .select('id')
        .eq('recipe_id', recipeId);
      if (subRecipesError) throw subRecipesError;

      for (const { id: subRecipeId } of subRecipes) {
        await deleteSubRecipe(subRecipeId);
      }

      await deleteRecipeIngredients(recipeId);
      await deleteTags(recipeId);

      const { error: deleteRecipeError } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);
      if (deleteRecipeError) throw deleteRecipeError;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteRecipe, isDeleting, error };
};