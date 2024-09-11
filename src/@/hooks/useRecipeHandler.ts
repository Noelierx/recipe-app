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
      const { title, instructions, servings } = recipe;
      let recipeResult: RecipeResult;

      if (recipeId) {
        const { data, error } = await supabase
          .from('recipes')
          .update({ title, instructions, servings })
          .eq('id', recipeId)
          .select()
          .single();
        if (error) throw error;
        recipeResult = data;
      } else {
        const { data, error } = await supabase
          .from('recipes')
          .insert({ title, instructions, servings })
          .select()
          .single();
        if (error) throw error;
        recipeResult = data;
      }

      if (recipeId) {
        await supabase
          .from('recipe_ingredients')
          .delete()
          .eq('recipe_id', recipeId);
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

      await supabase
        .from('recipe_ingredients')
        .insert(updatedIngredients);

      if (recipeId) {
        const { data: existingSubRecipes } = await supabase
          .from('sub_recipes')
          .select('id')
          .eq('recipe_id', recipeId);

        for (const subRecipe of subRecipes) {
          if (subRecipe.id && existingSubRecipes?.some(esr => esr.id === subRecipe.id)) {
            await supabase
              .from('sub_recipes')
              .update({
                title: subRecipe.title,
                instructions: subRecipe.instructions
              })
              .eq('id', subRecipe.id);
          } else {
            const { data: subRecipeData, error: subRecipeError } = await supabase
              .from('sub_recipes')
              .insert({
                recipe_id: recipeResult.id,
                title: subRecipe.title,
                instructions: subRecipe.instructions
              })
              .select('id')
              .single();

            if (subRecipeError) throw subRecipeError;
            subRecipe.id = subRecipeData.id;
          }

          await supabase
            .from('sub_recipe_ingredients')
            .delete()
            .eq('sub_recipe_id', subRecipe.id);

          const updatedSubIngredients = await Promise.all(subRecipe.ingredients.map(async (ing) => {
            const ingredientData = await createIngredientIfNotExists(ing.ingredient);
            return {
              sub_recipe_id: subRecipe.id,
              ingredient_id: ingredientData.id,
              amount: ing.amount,
              unit: ing.unit
            };
          }));

          await supabase
            .from('sub_recipe_ingredients')
            .insert(updatedSubIngredients);
        }
      }

      const allTagNames = [...existingTags.map(tag => tag.name), ...newTags];
      const allTagObjects = await Promise.all(allTagNames.map(createTagIfNotExists));
      
      await supabase
        .from('recipe_tags')
        .upsert(allTagObjects.map(tag => ({ recipe_id: recipeResult.id, tag_id: tag.id })));

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