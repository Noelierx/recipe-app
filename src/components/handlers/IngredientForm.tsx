import React, { useState, useEffect } from 'react';
import { CirclePlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { RecipeIngredient, Ingredient } from '@/types/RecipeTypes';
import { allowedUnits } from '@/constants';

interface IngredientFormProps {
  addIngredient: (name: string) => Promise<number | null>;
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
  existingIngredients: Ingredient[];
  loading: boolean;
  error: string | null;
}

interface NewIngredientState {
  name: string;
  amount: number;
  unit: string;
  id: number;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ addIngredient, setIngredients, existingIngredients, loading, error }) => {
  const [newIngredient, setNewIngredient] = useState<NewIngredientState>({
    name: '',
    amount: 0,
    unit: '',
    id: 0
  });
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>(existingIngredients);

  useEffect(() => {
    setAllIngredients(existingIngredients);
  }, [existingIngredients]);

  const getProcessedValue = (name: string, value: string): number | string => {
    if (name === 'amount') {
      const parsed = Number(value);
      if (value !== '' && isNaN(parsed)) {
        throw new Error('Invalid number input');
      }
      return value === '' ? 0 : parsed;
    }
    return value;
  };

  const handleValueChange = (name: string, value: string) => {
    const processedValue = getProcessedValue(name, value);
    setNewIngredient(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleValueChange(e.target.name, e.target.value);
  };

  const handleSelectChange = (name: string, value: string) => {
    handleValueChange(name, value);
  };

  const addNewIngredient = async () => {
    if (newIngredient.name && newIngredient.amount !== undefined && newIngredient.unit) {
      const ingredientId = await addIngredient(newIngredient.name);
      if (ingredientId) {
        const newIng = {
          id: ingredientId,
          name: newIngredient.name,
          amount: newIngredient.amount,
          unit: newIngredient.unit,
        };
        setIngredients(prev => [
          ...prev,
          {
            amount: newIngredient.amount,
            unit: newIngredient.unit,
            ingredient: newIng
          }
        ]);
        setAllIngredients(prev => [...prev, newIng]);
        setNewIngredient({ name: '', amount: 0, unit: '', id: 0 });
      } else {
        alert('Échec de l\'ajout de l\'ingrédient. Veuillez réessayer.');
      }
    } else {
      alert('Veuillez remplir tous les champs de l\'ingrédient.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Mobile: Stacked layout */}
      <div className="sm:hidden space-y-2">
        <Combobox
          items={allIngredients.map(ingredient => ({ label: ingredient.name, value: ingredient.name }))}
          onSelect={(value: string) => {
            const selectedIngredient = allIngredients.find(ingredient => ingredient.name === value);
            if (selectedIngredient) {
              setNewIngredient(prev => ({
                ...prev,
                name: selectedIngredient.name
              }));
            } else {
              setNewIngredient(prev => ({
                ...prev,
                name: value
              }));
            }
          }}
          placeholder="Rechercher ou ajouter un ingrédient..."
          renderItem={(item) => <div>{item.label}</div>}
        />
        <div className="flex gap-2">
          <Input
            name="amount"
            type="number"
            value={newIngredient.amount}
            onChange={handleInputChange}
            placeholder="Quantité"
            className="flex-1 h-11"
          />
          <Select
            name="unit"
            value={newIngredient.unit}
            onValueChange={(value) => handleSelectChange('unit', value)}
          >
            <SelectTrigger className="flex-1 h-11">
              <SelectValue placeholder="Unité" />
            </SelectTrigger>
            <SelectContent>
              {allowedUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={addNewIngredient} disabled={loading} className="w-full" size="sm">
          <CirclePlus className="mr-2 h-4 w-4"/> Ajouter
        </Button>
      </div>

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex sm:space-x-2 sm:items-center">
        <Combobox
          items={allIngredients.map(ingredient => ({ label: ingredient.name, value: ingredient.name }))}
          onSelect={(value: string) => {
            const selectedIngredient = allIngredients.find(ingredient => ingredient.name === value);
            if (selectedIngredient) {
              setNewIngredient(prev => ({
                ...prev,
                name: selectedIngredient.name
              }));
            } else {
              setNewIngredient(prev => ({
                ...prev,
                name: value
              }));
            }
          }}
          placeholder="Rechercher ou ajouter un ingrédient..."
          renderItem={(item) => <div>{item.label}</div>}
          className="flex-1"
        />
        <Input
          name="amount"
          type="number"
          value={newIngredient.amount}
          onChange={handleInputChange}
          placeholder="Quantité"
          className="w-24 h-11"
        />
        <Select
          name="unit"
          value={newIngredient.unit}
          onValueChange={(value) => handleSelectChange('unit', value)}
        >
          <SelectTrigger className="w-32 h-11">
            <SelectValue placeholder="Unité" />
          </SelectTrigger>
          <SelectContent>
            {allowedUnits.map(unit => (
              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={addNewIngredient} disabled={loading} size="sm">
          <CirclePlus className="mr-2 h-4 w-4"/> Ajouter
        </Button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default IngredientForm;