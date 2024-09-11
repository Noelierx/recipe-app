import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Recipe, RecipeIngredient, Tag } from '@/types/types';

export const useUpdateRecipe = (recipeId: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRecipe = async (
    recipe: Partial<Recipe>,
    ingredients: RecipeIngredient[],
    existingTags: Tag[],
    newTags: string[]
  ) => {
    setLoading(true);
    setError(null);

    try {
        const { error: recipeError } = await supabase
            .from('recipes')
            .update({
                title: recipe.title,
                instructions: recipe.instructions,
                servings: recipe.servings
            })
            .eq('id', recipeId);

        if (recipeError) throw recipeError;

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

        await supabase
            .from('recipe_ingredients')
            .delete()
            .eq('recipe_id', recipeId);

        const newRecipeIngredients = updatedIngredients.map(ing => ({
            recipe_id: recipeId,
            ingredient_id: ing.ingredient.id,
            amount: ing.amount,
            unit: ing.unit
        }));


        const { error: ingredientsError } = await supabase
            .from('recipe_ingredients')
            .insert(newRecipeIngredients);

        if (ingredientsError) throw ingredientsError;

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

        await supabase
            .from('recipe_tags')
            .delete()
            .eq('recipe_id', recipeId);

        const newRecipeTags = Array.from(new Set(allTagObjects
            .filter(tag => tag && tag.id)
            .map(tag => JSON.stringify({
                recipe_id: recipeId,
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
      return true;
    } catch (err) {
      setError((err as Error).message || 'An error occurred while updating the recipe');
      setLoading(false);
      return false;
    }
  };

  return { updateRecipe, loading, error };
};