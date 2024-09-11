import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Recipe, RecipeIngredient, Tag } from '@/types/types';

const deduplicate = <T, K extends keyof T>(array: T[], key: K) => {
  return Array.from(new Map(array.map(item => [item[key], item])).values());
};

export const useAddRecipe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRecipe = async (recipe: Recipe, ingredients: RecipeIngredient[], tags: Tag[]): Promise<number> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.from('recipes').insert(recipe).select('id').single();
      if (error) throw error;

      const recipeId = data.id;

      const formattedIngredients = ingredients.map(ing => ({
        recipe_id: recipeId,
        ingredient_id: ing.ingredient.id,
        amount: ing.amount,
        unit: ing.unit,
      }));
      const uniqueIngredients = deduplicate(formattedIngredients, 'ingredient_id');

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .upsert(uniqueIngredients, { onConflict: 'recipe_id,ingredient_id' });

      if (ingredientsError) throw new Error(`Ingredients insertion error: ${ingredientsError.message}`);

      // Insert tags
      const existingTags = tags.filter(tag => tag.id !== undefined);
      const newTags = tags.filter(tag => tag.id === undefined);

      if (newTags.length > 0) {
        const { data: insertedTags, error: newTagsError } = await supabase
          .from('tags')
          .insert(newTags.map(tag => ({ name: tag.name })))
          .select();

        if (newTagsError) throw new Error(`New tags insertion error: ${newTagsError.message}`);

        existingTags.push(...insertedTags);
      }

      const recipeTags = existingTags.map(tag => ({
        recipe_id: recipeId,
        tag_id: tag.id
      }));

      const { error: recipeTagsError } = await supabase
        .from('recipe_tags')
        .insert(recipeTags);

      if (recipeTagsError) throw new Error(`Recipe tags insertion error: ${recipeTagsError.message}`);

      // Remove the following block as it's redundant
      // if (tags.length > 0) {
      //   const { error: tagError } = await supabase
      //     .from('recipe_tags')
      //     .insert(tags.map(tag => ({ recipe_id: recipeId, tag_id: tag.id })));
      
      //   if (tagError) throw tagError;
      // }

      alert('Recipe added successfully!');
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