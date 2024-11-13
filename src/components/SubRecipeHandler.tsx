import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IngredientHandler from './IngredientHandler';
import { SubRecipe, RecipeIngredient } from '@/types/types';
import { useDeleteRecipe } from '@/hooks/useDeleteRecipe';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Importer le style de Quill

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
          <Label htmlFor={`subrecipe-title-${index}`}>Titre</Label>
          <Input
            id={`subrecipe-title-${index}`}
            value={subRecipe.title}
            onChange={(e) => handleSubRecipeChange(index, 'title', e.target.value)}
            placeholder="titre de la sous-recette"
          />
          <Label htmlFor={`subrecipe-instructions-${index}`}>Instructions</Label>
          <ReactQuill
            id={`subrecipe-instructions-${index}`}
            value={subRecipe.instructions}
            onChange={(value) => handleSubRecipeChange(index, 'instructions', value)}
            placeholder="Instructions de la sous-recette"
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
            Retirer la sous-recette
          </Button>
        </div>
      ))}
      <Button onClick={addSubRecipe}>Ajouter une sous-recette</Button>
    </div>
  );
};

export default React.memo(SubRecipeHandler);