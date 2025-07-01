import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { RecipeWithDetails } from '@/types/RecipeTypes';

export const useRecipeDetails = (recipeId: number) => {
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      try {
        const recipeData = await fetchRecipeData(recipeId);
        const ingredientsData = await fetchIngredientsData(recipeId);
        const tagsData = await fetchTagsData(recipeId);
        const subRecipesData = await fetchSubRecipesData(recipeId);

        const recipeWithDetails = constructRecipeWithDetails(
          recipeData,
          ingredientsData,
          tagsData,
          subRecipesData
        );

        setRecipe(recipeWithDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  return { recipe, loading, error };
};

const fetchRecipeData = async (recipeId: number) => {
  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', recipeId)
    .single();

  if (recipeError) throw new Error(recipeError.message);
  if (!recipeData) throw new Error('Recipe not found');
  return recipeData;
};

const fetchIngredientsData = async (recipeId: number) => {
  const { data: ingredientsData, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select(`
      amount,
      unit,
      order_position,
      ingredient:ingredients (name)
    `)
    .eq('recipe_id', recipeId)
    .order('order_position', { ascending: true });

  if (ingredientsError) throw new Error(ingredientsError.message);
  return ingredientsData || [];
};

const fetchTagsData = async (recipeId: number) => {
  const { data: tagsData, error: tagsError } = await supabase
    .from('recipe_tags')
    .select(`
      tag:tags (name)
    `)
    .eq('recipe_id', recipeId);

  if (tagsError) throw new Error(tagsError.message);
  return tagsData ? tagsData.map(t => t.tag) : [];
};

const fetchSubRecipesData = async (recipeId: number) => {
  const { data: subRecipesData, error: subRecipesError } = await supabase
    .from('sub_recipes')
    .select(`
      id,
      title,
      instructions,
      sub_recipe_ingredients (
        amount,
        unit,
        order_position,
        ingredient:ingredients (id, name)
      )
    `)
    .eq('recipe_id', recipeId);

  if (subRecipesError) throw new Error(subRecipesError.message);
  return subRecipesData || [];
};

const constructRecipeWithDetails = (
  recipeData: any,
  ingredientsData: any,
  tagsData: any,
  subRecipesData: any
): RecipeWithDetails => {
  return {
    ...recipeData,
    recipe_ingredients: ingredientsData.map((ingredient: any) => ({
      amount: ingredient.amount,
      unit: ingredient.unit,
      ingredient: ingredient.ingredient,
      order_position: ingredient.order_position
    })),
    tags: tagsData,
    sub_recipes: subRecipesData.map((sr: any) => ({
      ...sr,
      ingredients: sr.sub_recipe_ingredients
        .sort((a: any, b: any) => (a.order_position || 0) - (b.order_position || 0))
        .map((sri: any) => ({
          amount: sri.amount,
          unit: sri.unit,
          ingredient: sri.ingredient,
          order_position: sri.order_position
        }))
    })),
    prep_time: typeof recipeData.prep_time === 'number' ? recipeData.prep_time : null,
    cook_time: typeof recipeData.cook_time === 'number' ? recipeData.cook_time : null,
  };
};