import React, { useCallback } from 'react';
import { CirclePlus, Trash2 } from 'lucide-react';
import { IngredientHandler } from 'components/handlers';
import { RecipeInstructionsEditor } from 'components/recipe';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubRecipe, RecipeIngredient } from '@/types/RecipeTypes';
import { useDeleteRecipe } from '@/hooks/useDeleteRecipe';
import SubRecipeSelector from 'components/SubRecipeSelector';

interface SubRecipeHandlerProps {
  subRecipes: SubRecipe[];
  setSubRecipes: React.Dispatch<React.SetStateAction<SubRecipe[]>>;
  recipeId?: number;
}

const SubRecipeHandler: React.FC<SubRecipeHandlerProps> = ({ 
  subRecipes, 
  setSubRecipes 
}) => {
  const { deleteSubRecipe, isDeleting, error } = useDeleteRecipe();

  const handleSubRecipeChange = useCallback((index: number, field: keyof SubRecipe, value: string | RecipeIngredient[] | ((prev: RecipeIngredient[]) => RecipeIngredient[])) => {
    setSubRecipes(prevSubRecipes => 
      prevSubRecipes.map((subRecipe, i) => 
        i === index 
          ? { ...subRecipe, [field]: typeof value === 'function' ? value(subRecipe.ingredients) : value }
          : subRecipe
      )
    );
  }, [setSubRecipes]);

  const addSubRecipe = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSubRecipes(prevSubRecipes => [
      ...prevSubRecipes, 
      { id: Date.now(), title: '', instructions: '', ingredients: [] }
    ]);
  }, [setSubRecipes]);

  const addExistingSubRecipe = useCallback((selectedSubRecipe: SubRecipe) => {
    setSubRecipes(prevSubRecipes => [
      ...prevSubRecipes,
      {
        ...selectedSubRecipe,
        isReference: true,
        originalId: selectedSubRecipe.id,
        id: undefined, // Don't assign new ID for references
      }
    ]);
  }, [setSubRecipes]);

  const removeSubRecipe = useCallback(async (index: number) => {
    const subRecipe = subRecipes[index];
    
    // If it's a reference, just remove it from the list without deleting from database
    if (subRecipe.isReference) {
      setSubRecipes(prev => prev.filter((_, i) => i !== index));
      return;
    }
    
    // For non-reference subrecipes, delete from database if they have an ID
    if (subRecipe.id) {
      const success = await deleteSubRecipe(subRecipe.id);
      if (success) {
        setSubRecipes(prev => prev.filter((_, i) => i !== index));
      } else {
        console.error('Échec de la suppression de la sous-recette :', error);
      }
    } else {
      setSubRecipes(prev => prev.filter((_, i) => i !== index));
    }
  }, [subRecipes, setSubRecipes, deleteSubRecipe, error]);

  return (
    <div>
      <h3>Sous-recette</h3>
      {subRecipes.map((subRecipe, index) => (
        <div key={index} className="space-y-2 mb-4">
          {subRecipe.isReference && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-2">
              <p className="text-sm text-blue-700">📎 Sous-recette référencée (non modifiable)</p>
            </div>
          )}
          <Label htmlFor={`subrecipe-title-${index}`}>Titre</Label>
          <Input
            id={`subrecipe-title-${index}`}
            value={subRecipe.title}
            onChange={(e) => !subRecipe.isReference && handleSubRecipeChange(index, 'title', e.target.value)}
            placeholder="titre de la sous-recette"
            readOnly={subRecipe.isReference}
          />
          <Label htmlFor={`subrecipe-instructions-${index}`}>Instructions</Label>
          <RecipeInstructionsEditor
            value={subRecipe.instructions}
            onChange={(value) => !subRecipe.isReference && handleSubRecipeChange(index, 'instructions', value)}
            placeholder="Instructions de la sous-recette"
          />
          {!subRecipe.isReference && (
            <IngredientHandler
              ingredients={subRecipe.ingredients || []}
              setIngredients={(ingredients) => handleSubRecipeChange(index, 'ingredients', ingredients)}
            />
          )}
          {subRecipe.isReference && (
            <div>
              <Label>Ingrédients (lecture seule)</Label>
              <div className="border rounded p-3 bg-gray-50">
                {subRecipe.ingredients.map((ing, ingIndex) => (
                  <div key={ingIndex} className="text-sm mb-1">
                    {ing.ingredient.name}: {ing.amount} {ing.unit}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button 
            type="button" 
            onClick={() => removeSubRecipe(index)}
            variant="destructive"
            disabled={isDeleting}
          >
            <Trash2 className="mr-2" /> {subRecipe.isReference ? 'Retirer la référence' : 'Retirer la sous-recette'}
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Button onClick={addSubRecipe}>
          <CirclePlus className="mr-2" /> Ajouter une sous-recette
        </Button>
        <SubRecipeSelector onSelectSubRecipe={addExistingSubRecipe} />
      </div>
    </div>
  );
};

export default React.memo(SubRecipeHandler);