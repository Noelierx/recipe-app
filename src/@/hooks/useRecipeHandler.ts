import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Recipe, RecipeIngredient, Tag } from '@/types/types';

interface RecipeResult {
  id: number;
}

export const useRecipeHandler = (recipeId?: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecipe = async (
    recipe: Partial<Recipe>,
    ingredients: RecipeIngredient[],
    existingTags: Tag[],
    newTags: string[]
  ): Promise<number | boolean> => {
    setLoading(true);
    setError(null);

    try {
      let recipeResult: RecipeResult;
      if (recipeId) {
        // Update existing recipe
        const { error: recipeError } = await supabase
          .from('recipes')
          .update({
            title: recipe.title,
            instructions: recipe.instructions,
            servings: recipe.servings
          })
          .eq('id', recipeId);

        if (recipeError) throw recipeError;
        recipeResult = { id: recipeId };
      } else {
        // Add new recipe
        const { data, error: recipeError } = await supabase
          .from('recipes')
          .insert(recipe)
          .select('id')
          .single();

        if (recipeError) throw recipeError;
        if (!data) throw new Error('No data returned from insert operation');
        recipeResult = data as RecipeResult;
      }

      // Handle ingredients
      const updatedIngredients = await Promise.all(ingredients.map(async (ing) => {
        if (!ing.ingredient.id) {
          const { data, error } = await supabase
            .from('ingredients')
            .insert({ name: ing.ingredient.name })
            .select()
            .single();
          
          if (error) throw error;
          return { ...ing, ingredient: { ...ing.ingredient, id: data.id } };
        }
        return ing;
      }));

      if (recipeId) {
        await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipeId);
      }

      const newRecipeIngredients = updatedIngredients.map(ing => ({
        recipe_id: recipeResult.id,
        ingredient_id: ing.ingredient.id,
        amount: ing.amount,
        unit: ing.unit
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(newRecipeIngredients);

      if (ingredientsError) throw ingredientsError;

      // Handle tags
      const allTagNames = [...existingTags.map(t => t.name), ...newTags];
      const allTagObjects = await Promise.all(allTagNames.map(async (tagName) => {
        const { data, error } = await supabase
          .from('tags')
          .select()
          .eq('name', tagName)
          .single();
        
        if (error) {
          const { data: newData, error: insertError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select()
            .single();
          
          if (insertError) throw insertError;
          return newData;
        }
        return data;
      }));

      if (recipeId) {
        await supabase
          .from('recipe_tags')
          .delete()
          .eq('recipe_id', recipeId);
      }

      const newRecipeTags = Array.from(new Set(allTagObjects
        .filter((tag): tag is { id: number } => tag !== null && tag !== undefined && typeof tag.id === 'number')
        .map(tag => JSON.stringify({
          recipe_id: recipeResult.id,
          tag_id: tag.id
        }))))
        .map(str => JSON.parse(str));

      if (newRecipeTags.length > 0) {
        const { error: tagsError } = await supabase
          .from('recipe_tags')
          .insert(newRecipeTags);

        if (tagsError) throw tagsError;
      }

      setLoading(false);
      return recipeId ? true : recipeResult.id;
    } catch (err) {
      setError((err as Error).message || 'An error occurred while handling the recipe');
      setLoading(false);
      return false;
    }
  };

  return { handleRecipe, loading, error };
};