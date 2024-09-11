import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Recipe, RecipeIngredient } from '@/types/types';

const deduplicate = <T, K extends keyof T>(array: T[], key: K) => {
  return Array.from(new Map(array.map(item => [item[key], item])).values());
};

export const useAddRecipe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addRecipe = async (recipe: Recipe, ingredients: RecipeIngredient[]) => {
    try {
      setLoading(true);
      setError(null);

      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([{ title: recipe.title, instructions: recipe.instructions, servings: recipe.servings }])
        .select()
        .single();

      if (recipeError) throw new Error(`Recipe insertion error: ${recipeError.message}`);

      const recipeId = recipeData.id;
      console.log('Recipe inserted with ID:', recipeId);

      const formattedIngredients = ingredients.map(ing => ({
        recipe_id: recipeId,
        ingredient_id: ing.ingredient.id,
        amount: ing.amount,
        unit: ing.unit,
      }));
      const uniqueIngredients = deduplicate(formattedIngredients, 'ingredient_id');
      console.log('Unique Ingredients to insert:', uniqueIngredients);

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .upsert(uniqueIngredients, { onConflict: 'recipe_id,ingredient_id' });

      if (ingredientsError) throw new Error(`Ingredients insertion error: ${ingredientsError.message}`);
      console.log('Ingredients inserted or updated successfully');

      alert('Recipe added successfully!');
    } catch (err) {
      console.error('Error in addRecipe:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { addRecipe, loading, error };
};