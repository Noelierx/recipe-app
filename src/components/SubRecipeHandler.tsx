import React, { useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import IngredientHandler from './IngredientHandler';
import { SubRecipe, RecipeIngredient } from '@/types/types';
import { useRecipeDetails } from '@/hooks/useRecipeDetails';

interface SubRecipeHandlerProps {
  subRecipes: SubRecipe[];
  setSubRecipes: React.Dispatch<React.SetStateAction<SubRecipe[]>>;
  recipeId: number | undefined;
}

interface SubRecipeHandlerProps {
  subRecipes: SubRecipe[];
  onSubRecipesChange: (updatedSubRecipes: SubRecipe[]) => void;
  recipeId: number | undefined;
}

const SubRecipeHandler: React.FC<SubRecipeHandlerProps> = ({ 
  subRecipes, 
  onSubRecipesChange, 
  recipeId 
}) => {
  const { recipe } = useRecipeDetails(recipeId ?? 0);

  useEffect(() => {
    if (recipeId && recipe && recipe.sub_recipes && JSON.stringify(subRecipes) !== JSON.stringify(recipe.sub_recipes)) {
      onSubRecipesChange(recipe.sub_recipes);
    }
  }, [recipe, recipeId, subRecipes, onSubRecipesChange]); // Add onSubRecipesChange here

  const handleSubRecipeChange = useCallback((index: number, field: keyof SubRecipe, value: string | RecipeIngredient[] | ((prev: RecipeIngredient[]) => RecipeIngredient[])) => {
    const updatedSubRecipes = subRecipes.map((subRecipe, i) => 
      i === index 
        ? { 
            ...subRecipe, 
            [field]: field === 'ingredients' && typeof value === 'function' 
              ? value(subRecipe.ingredients || []) 
              : value 
          }
        : subRecipe
    );
    onSubRecipesChange(updatedSubRecipes);
  }, [subRecipes, onSubRecipesChange]); // Add onSubRecipesChange here

  const addSubRecipe = useCallback(() => {
    onSubRecipesChange([...subRecipes, { id: subRecipes.length, title: '', instructions: '', ingredients: [] }]);
  }, [subRecipes, onSubRecipesChange]); // Add onSubRecipesChange here

  return (
    <div>
      {subRecipes.map((subRecipe, index) => (
        <div key={subRecipe.id || index} className="space-y-2 mb-4">
          <Label htmlFor="title">Title</Label>
          <Input
            value={subRecipe.title}
            onChange={(e) => handleSubRecipeChange(index, 'title', e.target.value)}
            placeholder="Sub-recipe title"
          />
          <Label htmlFor="title">Instructions</Label>
          <Textarea
            value={subRecipe.instructions}
            onChange={(e) => handleSubRecipeChange(index, 'instructions', e.target.value)}
            placeholder="Sub-recipe instructions"
          />
          <IngredientHandler
            ingredients={subRecipe.ingredients || []}
            setIngredients={(ingredients) => handleSubRecipeChange(index, 'ingredients', ingredients)}
          />
        </div>
      ))}
      <Button type="button" onClick={addSubRecipe}>Ajouter une sous-recette</Button>
    </div>
  );
};

export default React.memo(SubRecipeHandler);