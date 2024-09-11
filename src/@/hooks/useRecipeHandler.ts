import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Recipe, RecipeIngredient, Tag } from '@/types/types';

interface RecipeResult {
  id: number;
}

const createIngredientIfNotExists = async (ingredient: Partial<RecipeIngredient['ingredient']>) => {
  const { data, error } = await supabase
    .from('ingredients')
    .select()
    .eq('name', ingredient.name)
    .single();

  if (error) {
    const { data: newData, error: insertError } = await supabase
      .from('ingredients')
      .insert({ name: ingredient.name })
      .select()
      .single();

    if (insertError) throw insertError;
    return newData;
  }
  return data;
};

const createTagIfNotExists = async (tagName: string) => {
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
};

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
        const { data, error: recipeError } = await supabase
          .from('recipes')
          .insert(recipe)
          .select('id')
          .single();

        if (recipeError) throw recipeError;
        if (!data) throw new Error('No data returned from insert operation');
        recipeResult = data as RecipeResult;
      }

      const updatedIngredients = await Promise.all(ingredients.map(async (ing) => {
        if (!ing.ingredient.id) {
          const data = await createIngredientIfNotExists(ing.ingredient);
          return { ...ing, ingredient: { ...ing.ingredient, id: data.id } };
        }
        return ing;
      }));

      await supabase
        .from('recipe_ingredients')
        .upsert(updatedIngredients.map(ing => ({
          recipe_id: recipeResult.id,
          ingredient_id: ing.ingredient.id,
          amount: ing.amount,
          unit: ing.unit
        })));

      const allTagNames = [...existingTags.map(tag => tag.name), ...newTags];
      const allTagObjects = await Promise.all(allTagNames.map(createTagIfNotExists));
      
      await supabase
        .from('recipe_tags')
        .upsert(allTagObjects.map(tag => ({ recipe_id: recipeResult.id, tag_id: tag.id })));

      setLoading(false);
      return recipeResult.id;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  return { handleRecipe, loading, error };
};