import { useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Recipe, RecipeIngredient, Tag } from '@/types/types';

type SubRecipeIngredient = RecipeIngredient & { id: string };
type SubRecipe = { id?: number; title: string; instructions: string; ingredients: SubRecipeIngredient[] };

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

const handleMainRecipe = async (recipeId: number | undefined, recipe: Partial<Recipe>): Promise<RecipeResult> => {
  const { data, error } = await supabase
    .from('recipes')
    .upsert({ id: recipeId, ...recipe })
    .select()
    .single();
  if (error) throw error;
  return data;
};

const handleIngredients = async (recipeId: number | undefined, mainIngredients: RecipeIngredient[], recipeResult: RecipeResult) => {
  if (recipeId) {
    const { error: deleteError } = await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
    if (deleteError) throw deleteError;
  }
  
  const updatedIngredients = await Promise.all(mainIngredients.map(async (ing) => {
    const ingredientData = await createIngredientIfNotExists(ing.ingredient);
    return {
      recipe_id: recipeResult.id,
      ingredient_id: ingredientData.id,
      amount: ing.amount,
      unit: ing.unit
    };
  }));
  
  const { error: insertError } = await supabase.from('recipe_ingredients').insert(updatedIngredients);
  if (insertError) throw insertError;
};

const handleSubRecipes = async (recipeId: number | undefined, subRecipes: SubRecipe[], recipeResult: RecipeResult) => {
  if (!recipeId) return;

  const existingSubRecipeIds = await fetchExistingSubRecipeIds(recipeId);

  for (const subRecipe of subRecipes) {
    await processSubRecipe(subRecipe, existingSubRecipeIds, recipeResult);
  }

  await deleteRemainingSubRecipes(existingSubRecipeIds);
};

const fetchExistingSubRecipeIds = async (recipeId: number) => {
  const { data: existingSubRecipes, error: fetchError } = await supabase
    .from('sub_recipes')
    .select('id')
    .eq('recipe_id', recipeId);

  if (fetchError) throw fetchError;
  return new Set(existingSubRecipes.map(sr => sr.id));
};

const processSubRecipe = async (subRecipe: SubRecipe, existingSubRecipeIds: Set<number>, recipeResult: RecipeResult) => {
  if (subRecipe.id && existingSubRecipeIds.has(subRecipe.id)) {
    await updateSubRecipe(subRecipe);
    existingSubRecipeIds.delete(subRecipe.id);
  } else {
    await insertSubRecipe(subRecipe, recipeResult);
  }

  await handleSubRecipeIngredients(subRecipe);
};

const updateSubRecipe = async (subRecipe: SubRecipe) => {
  const { error: updateError } = await supabase
    .from('sub_recipes')
    .update({ title: subRecipe.title, instructions: subRecipe.instructions })
    .eq('id', subRecipe.id);

  if (updateError) throw updateError;
};

const insertSubRecipe = async (subRecipe: SubRecipe, recipeResult: RecipeResult) => {
  const { data: subRecipeData, error: insertError } = await supabase
    .from('sub_recipes')
    .insert({ recipe_id: recipeResult.id, title: subRecipe.title, instructions: subRecipe.instructions })
    .select('id')
    .single();

  if (insertError) throw insertError;
  subRecipe.id = subRecipeData.id;
};

const handleSubRecipeIngredients = async (subRecipe: SubRecipe) => {
  await supabase.from('sub_recipe_ingredients').delete().eq('sub_recipe_id', subRecipe.id);
  const updatedSubIngredients = await Promise.all(subRecipe.ingredients.map(async (ing) => {
    const ingredientData = await createIngredientIfNotExists(ing.ingredient);
    return {
      sub_recipe_id: subRecipe.id,
      ingredient_id: ingredientData.id,
      amount: ing.amount,
      unit: ing.unit
    };
  }));
  await supabase.from('sub_recipe_ingredients').insert(updatedSubIngredients);
};

const deleteRemainingSubRecipes = async (existingSubRecipeIds: Set<number>) => {
  if (existingSubRecipeIds.size > 0) {
    await supabase.from('sub_recipes').delete().in('id', Array.from(existingSubRecipeIds));
  }
};

const handleTags = async (recipeId: number | undefined, existingTags: Tag[], newTags: string[], recipeResult: RecipeResult) => {
  const allTagNames = [...existingTags.map(tag => tag.name), ...newTags];
  const allTagObjects = await Promise.all(allTagNames.map(createTagIfNotExists));

  if (recipeId) {
    await supabase.from('recipe_tags').delete().eq('recipe_id', recipeId);
  }
  
  await supabase.from('recipe_tags').insert(allTagObjects.map(tag => ({ recipe_id: recipeResult.id, tag_id: tag.id })));
};

export const useRecipeHandler = (recipeId?: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subRecipes, setSubRecipes] = useState<SubRecipe[]>([]);

  const handleRecipe = async (
    recipe: Partial<Recipe>,
    mainIngredients: RecipeIngredient[],
    subRecipes: SubRecipe[],
    existingTags: Tag[],
    newTags: string[]
  ): Promise<number | boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { title, instructions, servings, prep_time, cook_time } = recipe;
      const recipeResult = await handleMainRecipe(recipeId, { title, instructions, servings, prep_time, cook_time });
      
      await handleIngredients(recipeId, mainIngredients, recipeResult);
      await handleSubRecipes(recipeId, subRecipes, recipeResult);
      await handleTags(recipeId, existingTags, newTags, recipeResult);

      setLoading(false);
      return recipeId ? true : recipeResult.id;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  const updateSubRecipes = (newSubRecipes: SubRecipe[]) => {
    setSubRecipes(newSubRecipes);
  };

  return { handleRecipe, loading, error, subRecipes, updateSubRecipes };
};