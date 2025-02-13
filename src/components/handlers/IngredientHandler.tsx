import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { RecipeIngredient } from '@/types/RecipeTypes';
import useIngredient from '@/hooks/useIngredient';
import IngredientForm from './IngredientForm';
import { allowedUnits, Unit } from '@/constants';
import { convertUnit } from '@/utils/unitConverter';

interface IngredientHandlerProps {
  ingredients: RecipeIngredient[];
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
}

const IngredientHandler: React.FC<IngredientHandlerProps> = ({ ingredients, setIngredients }) => {
  const { addIngredient, ingredients: existingIngredients, loading, error } = useIngredient();

  const updateIngredient = (index: number, field: string, value: string | number) => {
    setIngredients(prev => prev.map((ing, i) => {
      if (i !== index) return ing;
      if (field === 'amount') {
        const { amount, unit } = convertUnit(Number(value), ing.unit as Unit);
        return { ...ing, amount, unit };
      } else if (field === 'name') {
        return { 
          ...ing, 
          ingredient: { 
            ...ing.ingredient, 
            name: value as string 
          } 
        };
      } else {
        return { ...ing, [field]: value };
      }
    }));
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Label htmlFor="ingredients">Ingrédients</Label>
      {ingredients && ingredients.length > 0 ? (
        ingredients.map((ing, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              value={ing.amount}
              onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
              type="number"
              className="flex-1"
            />
            <Select
              name="unit"
              value={ing.unit}
              onValueChange={(value) => updateIngredient(index, 'unit', value)}
            >
              <SelectTrigger className="flex-1 border border-gray-300 rounded-md p-2">
                <SelectValue placeholder="Sélectionner une unité" />
              </SelectTrigger>
              <SelectContent>
                {allowedUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={ing.ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={() => removeIngredient(index)} variant="destructive" size="sm" className="flex-1">
              <Trash2 className="mr-2" /> Retirer l'ingrédient
            </Button>
          </div>
        ))
      ) : (
        <p>Aucun ingrédient ajouté pour le moment.</p>
      )}
      <IngredientForm
        addIngredient={addIngredient}
        setIngredients={setIngredients}
        existingIngredients={existingIngredients}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default IngredientHandler;