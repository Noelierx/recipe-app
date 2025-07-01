import { useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import { supabase } from '@/utils/supabaseClient';
import { Recipe, RecipeIngredient, Tag, SubRecipe } from '@/types/RecipeTypes';

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

const updateTagInDatabase = async (tagId: string, newTagName: string) => {
  if (!tagId?.trim() || !newTagName?.trim()) {
    throw new Error('Tag ID and new name are required');
  }

  const { data: existingTag, error: fetchError } = await supabase
    .from('tags')
    .select()
    .eq('id', tagId)
    .single();

  if (fetchError || !existingTag) {
    throw new Error(`Tag with ID ${tagId} not found`);
  }

  const { data: duplicateTag, error: duplicateError } = await supabase
    .from('tags')
    .select()
    .eq('name', newTagName.trim())
    .neq('id', tagId)
    .maybeSingle();

  if (duplicateError) {
    throw new Error(`Error checking for duplicate tag: ${duplicateError.message}`);
  }

  if (duplicateTag) {
    throw new Error(`Tag with name "${newTagName}" already exists`);
  }

  const { error } = await supabase
    .from('tags')
    .update({ name: newTagName.trim() })
    .eq('id', tagId);

  if (error) throw new Error(`Error updating tag: ${error.message}`);
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
      const recipeResult = await upsertMainRecipe(recipe, recipeId);
      await handleMainIngredients(mainIngredients, recipeResult.id, recipeId);
  
      if (recipeId) {
        await handleSubRecipes(subRecipes, recipeResult.id, recipeId);
      } else {
        await handleSubRecipes(subRecipes, recipeResult.id, null);
      }
  
      await handleTags(existingTags, newTags, recipeResult.id, recipeId);
  
      setLoading(false);
      return recipeId ? true : recipeResult.id;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  const upsertMainRecipe = async (recipe: Partial<Recipe>, recipeId?: number): Promise<RecipeResult> => {
    const { title, instructions, servings, prep_time, cook_time } = recipe;

    const sanitizedInstructions = sanitizeHtml(instructions ?? '', {
      allowedTags: ['p', 'b', 'i', 'em', 'strong', 'u', 'ol', 'ul', 'li'],
      allowedAttributes: {}
    });

    let recipeResult: RecipeResult;

    if (recipeId) {
      const { data, error } = await supabase
        .from('recipes')
        .update({ title, instructions: sanitizedInstructions, servings, prep_time, cook_time })
        .eq('id', recipeId)
        .select()
        .single();
      if (error) throw error;
      recipeResult = data;
    } else {
      const { data, error } = await supabase
        .from('recipes')
        .insert({ title, instructions: sanitizedInstructions, servings, prep_time, cook_time })
        .select()
        .single();
      if (error) throw error;
      recipeResult = data;
    }
    return recipeResult;
  };

  const handleMainIngredients = async (mainIngredients: RecipeIngredient[], recipeId: number, existingRecipeId?: number) => {
    if (existingRecipeId) {
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', existingRecipeId);
    }

    const updatedIngredients = await Promise.all(mainIngredients.map(async (ing, index) => {
      const ingredientData = await createIngredientIfNotExists(ing.ingredient);
      return {
        recipe_id: recipeId,
        ingredient_id: ingredientData.id,
        amount: ing.amount,
        unit: ing.unit,
        order_position: ing.order_position ?? index
      };
    }));

    await supabase
      .from('recipe_ingredients')
      .insert(updatedIngredients);
  };

  const handleSubRecipes = async (subRecipes: SubRecipe[], recipeId: number, existingRecipeId: number | null) => {
    // Filter out referenced subrecipes - we don't want to save them to database
    const ownedSubRecipes = subRecipes.filter(sr => !sr.isReference);
    
    if (existingRecipeId !== null) {
      const { data: existingSubRecipes, error: fetchError } = await supabase
        .from('sub_recipes')
        .select('id')
        .eq('recipe_id', existingRecipeId);
      
      if (fetchError) throw fetchError;
      const existingSubRecipeIds = new Set(existingSubRecipes.map(sr => sr.id));
      for (const subRecipe of ownedSubRecipes) {
        await upsertSubRecipe(subRecipe, recipeId, existingSubRecipeIds);
      }
      if (existingSubRecipeIds.size > 0) {
        await supabase
          .from('sub_recipes')
          .delete()
          .in('id', Array.from(existingSubRecipeIds));
      }
    } else {
      for (const subRecipe of ownedSubRecipes) {
        await upsertSubRecipe(subRecipe, recipeId, new Set());
      }
    }
  };

  const upsertSubRecipe = async (subRecipe: SubRecipe, recipeId: number, existingSubRecipeIds: Set<number>) => {
    const sanitizedInstructions = sanitizeHtml(subRecipe.instructions, {
      allowedTags: ['p', 'b', 'i', 'em', 'strong', 'u', 'ol', 'ul', 'li'],
      allowedAttributes: {}
    });
  
    if (subRecipe.id && existingSubRecipeIds.has(subRecipe.id)) {
      const { error: updateError } = await supabase
        .from('sub_recipes')
        .update({
          title: subRecipe.title,
          instructions: sanitizedInstructions
        })
        .eq('id', subRecipe.id);
  
      if (updateError) throw updateError;
  
      existingSubRecipeIds.delete(subRecipe.id);
    } else {
      const { data: subRecipeData, error: insertError } = await supabase
        .from('sub_recipes')
        .insert({
          recipe_id: recipeId,
          title: subRecipe.title,
          instructions: sanitizedInstructions
        })
        .select('id')
        .single();
  
      if (insertError) throw insertError;
      subRecipe.id = subRecipeData.id;
    }
  
    await handleSubRecipeIngredients(subRecipe);
  };

  const handleSubRecipeIngredients = async (subRecipe: SubRecipe) => {
    await supabase
      .from('sub_recipe_ingredients')
      .delete()
      .eq('sub_recipe_id', subRecipe.id);
  
    const updatedSubIngredients = await Promise.all(subRecipe.ingredients.map(async (ing, index) => {
      const ingredientData = await createIngredientIfNotExists(ing.ingredient);
      return {
        sub_recipe_id: subRecipe.id,
        ingredient_id: ingredientData.id,
        amount: ing.amount,
        unit: ing.unit,
        order_position: ing.order_position ?? index
      };
    }));
  
    await supabase
      .from('sub_recipe_ingredients')
      .insert(updatedSubIngredients);
  };

  const handleTags = async (existingTags: Tag[], newTags: string[], recipeId: number, existingRecipeId?: number) => {
    const allTagNames = [...existingTags.map(tag => tag.name), ...newTags];
    const allTagObjects = await Promise.all(allTagNames.map(createTagIfNotExists));
    
    if (existingRecipeId) {
      await supabase
        .from('recipe_tags')
        .delete()
        .eq('recipe_id', existingRecipeId);
    }

    await supabase
      .from('recipe_tags')
      .insert(allTagObjects.map(tag => ({ recipe_id: recipeId, tag_id: tag.id })));
  };

  const updateTag = async (tagId: string, newTagName: string) => {
    await updateTagInDatabase(tagId, newTagName);
  };

  const updateSubRecipes = (newSubRecipes: SubRecipe[]) => {
    setSubRecipes(newSubRecipes);
  };

  return { handleRecipe, loading, error, subRecipes, updateSubRecipes, updateTag };
};