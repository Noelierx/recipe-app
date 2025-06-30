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
        id: undefined, // Remove ID to indicate this is a reference, not a saved entity
      }
    ]);
  }, [setSubRecipes]);

  const removeSubRecipe = useCallback(async (index: number) => {
    const subRecipe = subRecipes[index];
    
    // If it's a reference, just remove it from the UI without deleting from database
    if (subRecipe.isReference) {
      setSubRecipes(prev => prev.filter((_, i) => i !== index));
      return;
    }
    
    // If it's an owned subrecipe with an ID, delete from database
    if (subRecipe.id) {
      const success = await deleteSubRecipe(subRecipe.id);
      if (success) {
        setSubRecipes(prev => prev.filter((_, i) => i !== index));
      } else {
        console.error('Échec de la suppression de la sous-recette :', error);
      }
    } else {
      // If it's a new subrecipe (no ID), just remove from UI
      setSubRecipes(prev => prev.filter((_, i) => i !== index));
    }
  }, [subRecipes, setSubRecipes, deleteSubRecipe, error]);

  return (
    <div>
      <h3>Sous-recette</h3>
      {subRecipes.map((subRecipe, index) => (
        <div key={index} className="space-y-2 mb-4">
          {subRecipe.isReference && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              📎 Sous-recette référencée (non modifiable)
            </div>
          )}
          <Label htmlFor={`subrecipe-title-${index}`}>Titre</Label>
          <Input
            id={`subrecipe-title-${index}`}
            value={subRecipe.title}
            onChange={(e) => !subRecipe.isReference && handleSubRecipeChange(index, 'title', e.target.value)}
            placeholder="titre de la sous-recette"
            readOnly={subRecipe.isReference}
            className={subRecipe.isReference ? 'bg-gray-50' : ''}
          />
          <Label htmlFor={`subrecipe-instructions-${index}`}>Instructions</Label>
          {subRecipe.isReference ? (
            <div className="border rounded p-2 bg-gray-50 min-h-[100px]" dangerouslySetInnerHTML={{ __html: subRecipe.instructions }} />
          ) : (
            <RecipeInstructionsEditor
              value={subRecipe.instructions}
              onChange={(value) => handleSubRecipeChange(index, 'instructions', value)}
              placeholder="Instructions de la sous-recette"
            />
          )}
          {subRecipe.isReference ? (
            <div className="space-y-2">
              <Label>Ingrédients (non modifiable)</Label>
              <div className="border rounded p-2 bg-gray-50">
                {subRecipe.ingredients.map((ing, ingIndex) => (
                  <div key={ingIndex} className="flex justify-between items-center py-1">
                    <span>{ing.ingredient.name}</span>
                    <span>{ing.amount} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <IngredientHandler
              ingredients={subRecipe.ingredients || []}
              setIngredients={(ingredients) => handleSubRecipeChange(index, 'ingredients', ingredients)}
            />
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