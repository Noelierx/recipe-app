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
      const subRecipes = await getSubRecipes(recipeId);
      if (!subRecipes) return false;

      await Promise.all(subRecipes.map(({ id: subRecipeId }) => deleteSubRecipeAndIngredients(subRecipeId)));

      const recipeIngredients = await getRecipeIngredients(recipeId);
      if (!recipeIngredients) return false;

      await deleteRecipeIngredients(recipeId);
      await Promise.all(recipeIngredients.map(({ ingredient_id }) => deleteIngredient(ingredient_id)));

      const recipeTags = await getRecipeTags(recipeId);
      if (!recipeTags) return false;

      await deleteRecipeTags(recipeId);
      await deleteUnusedTags(recipeTags);

      await deleteMainRecipe(recipeId);

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

// New helper functions
const getSubRecipes = async (recipeId: number) => {
  const { data: subRecipes, error: subRecipesError } = await supabase
    .from('sub_recipes')
    .select('id')
    .eq('recipe_id', recipeId);
  if (subRecipesError) throw subRecipesError;
  return subRecipes;
};

const getRecipeIngredients = async (recipeId: number) => {
  const { data: recipeIngredients, error: recipeIngredientsError } = await supabase
    .from('recipe_ingredients')
    .select('ingredient_id')
    .eq('recipe_id', recipeId);
  if (recipeIngredientsError) throw recipeIngredientsError;
  return recipeIngredients;
};

const deleteRecipeIngredients = async (recipeId: number) => {
  const { error: deleteRecipeIngredientsError } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', recipeId);
  if (deleteRecipeIngredientsError) throw deleteRecipeIngredientsError;
};

const deleteIngredient = async (ingredientId: number) => {
  const { error: deleteIngredientError } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', ingredientId);
  if (deleteIngredientError) throw deleteIngredientError;
};

const getRecipeTags = async (recipeId: number) => {
  const { data: recipeTags, error: recipeTagsError } = await supabase
    .from('recipe_tags')
    .select('tag_id')
    .eq('recipe_id', recipeId);
  if (recipeTagsError) throw recipeTagsError;
  return recipeTags;
};

const deleteRecipeTags = async (recipeId: number) => {
  const { error: deleteRecipeTagsError } = await supabase
    .from('recipe_tags')
    .delete()
    .eq('recipe_id', recipeId);
  if (deleteRecipeTagsError) throw deleteRecipeTagsError;
};

const deleteUnusedTags = async (recipeTags: Array<{ tag_id: number }>) => {
  const tagIds = recipeTags.map(({ tag_id }) => tag_id);

  const { data: usedTags, error: countError } = await supabase
    .from('recipe_tags')
    .select('tag_id')
    .in('tag_id', tagIds);

  if (countError) throw countError;

  const usedTagIds = new Set(usedTags?.map(t => t.tag_id));
  const unusedTagIds = tagIds.filter(id => !usedTagIds.has(id));

  if (unusedTagIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('tags')
      .delete()
      .in('id', unusedTagIds);

    if (deleteError) throw deleteError;
  }
};

const deleteMainRecipe = async (recipeId: number) => {
  const { error: deleteRecipeError } = await supabase
    .from('recipes')
    .delete()
    .eq('id', recipeId);
  if (deleteRecipeError) throw deleteRecipeError;
};