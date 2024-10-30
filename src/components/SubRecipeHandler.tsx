import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import IngredientHandler from './IngredientHandler';
import { SubRecipe, RecipeIngredient } from '@/types/types';
import { useDeleteRecipe } from '@/hooks/useDeleteRecipe';

interface SubRecipeHandlerProps {
  subRecipes: SubRecipe[];
  setSubRecipes: React.Dispatch<React.SetStateAction<SubRecipe[]>>;
  recipeId?: number;
}


const SubRecipeHandler: React.FC<SubRecipeHandlerProps> = ({ 
  subRecipes,
  setSubRecipes 
}) => {
  const { deleteRecipe: deleteSubRecipe, isDeleting, error } = useDeleteRecipe();

  const handleSubRecipeChange = useCallback((index: number, field: keyof SubRecipe, value: string | RecipeIngredient[] | ((prev: RecipeIngredient[]) => RecipeIngredient[])) => {
    setSubRecipes(prevSubRecipes => 
      prevSubRecipes.map((subRecipe, i) => 
        i === index 
          ? { ...subRecipe, [field]: typeof value === 'function' ? value(subRecipe.ingredients) : value }
          : subRecipe
      )
    );
  }, [setSubRecipes]);

  const addSubRecipe = useCallback(() => {
    setSubRecipes(prevSubRecipes => [
      ...prevSubRecipes, 
      { id: Date.now(), title: '', instructions: '', ingredients: [] }
    ]);
  }, [setSubRecipes]);

  const removeSubRecipe = useCallback(async (index: number) => {
    const subRecipe = subRecipes[index];
    if (subRecipe.id) {
      const success = await deleteSubRecipe(subRecipe.id);
      if (success) {
        setSubRecipes(prev => prev.filter((_, i) => i !== index));
      } else {
        console.error('Failed to delete sub-recipe:', error);
      }
    } else {
      setSubRecipes(prev => prev.filter((_, i) => i !== index));
    }
  }, [subRecipes, setSubRecipes, deleteSubRecipe, error]);

  return (
    <div>
      <h3>Sub Recipes</h3>
      {subRecipes.map((subRecipe, index) => (
        <div key={index} className="space-y-2 mb-4">
          <Label htmlFor={`subrecipe-title-${index}`}>Title</Label>
          <Input
            id={`subrecipe-title-${index}`}
            value={subRecipe.title}
            onChange={(e) => handleSubRecipeChange(index, 'title', e.target.value)}
            placeholder="Sub-recipe title"
          />
          <Label htmlFor={`subrecipe-instructions-${index}`}>Instructions</Label>
          <Textarea
            id={`subrecipe-instructions-${index}`}
            value={subRecipe.instructions}
            onChange={(e) => handleSubRecipeChange(index, 'instructions', e.target.value)}
            placeholder="Sub-recipe instructions"
          />
          <IngredientHandler
            ingredients={subRecipe.ingredients || []}
            setIngredients={(ingredients) => handleSubRecipeChange(index, 'ingredients', ingredients)}
          />
          <Button 
            type="button" 
            onClick={() => removeSubRecipe(index)}
            variant="destructive"
            disabled={isDeleting}
          >
            Remove Sub-Recipe
          </Button>
        </div>
      ))}
      <Button onClick={addSubRecipe}>Add Sub-recipe</Button>
    </div>
  );
};

export default React.memo(SubRecipeHandler);