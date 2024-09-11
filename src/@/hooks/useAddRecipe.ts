import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Recipe, RecipeIngredient, Tag } from '@/types/types';

export const useAddRecipe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRecipe = async (recipe: Recipe, ingredients: RecipeIngredient[], tags: Tag[]): Promise<number> => {
    try {
      setLoading(true);
      setError(null);

      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert(recipe)
        .select('id')
        .single();

      if (recipeError) throw recipeError;
      const recipeId = recipeData.id;

      const formattedIngredients = ingredients.map(ing => ({
        recipe_id: recipeId,
        ingredient_id: ing.ingredient.id,
        amount: ing.amount,
        unit: ing.unit,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(formattedIngredients);

      if (ingredientsError) throw ingredientsError;

      const existingTags = tags.filter(tag => tag.id !== undefined);
      const newTags = tags.filter(tag => tag.id === undefined);

      if (newTags.length > 0) {
        const { data: insertedTags, error: newTagsError } = await supabase
          .from('tags')
          .insert(newTags.map(tag => ({ name: tag.name })))
          .select('id, name');

        if (newTagsError) throw newTagsError;

        existingTags.push(...insertedTags);
      }

      const recipeTags = existingTags.map(tag => ({
        recipe_id: recipeId,
        tag_id: tag.id
      }));

      const { error: recipeTagsError } = await supabase
        .from('recipe_tags')
        .insert(recipeTags);

      if (recipeTagsError) throw recipeTagsError;

      return recipeId;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { addRecipe, loading, error };
};