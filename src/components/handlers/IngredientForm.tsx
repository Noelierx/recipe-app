import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { CirclePlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { RecipeIngredient, Ingredient } from '@/types/RecipeTypes';
import { allowedUnits } from '@/constants';

interface IngredientFormProps {
  addIngredient: (name: string) => Promise<number | null>;
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
  existingIngredients: Ingredient[];
  loading: boolean;
  error: string | null;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ addIngredient, setIngredients, existingIngredients, loading, error }) => {
  const [newIngredient, setNewIngredient] = useState<Partial<RecipeIngredient & { amount: number }>>({
    ingredient: { id: 0, name: '', amount: 0, unit: '' },
    amount: 0,
    unit: ''
  });

  const getProcessedValue = (name: string, value: string): number | string => {
    if (name === 'amount') {
      return value === '' ? 0 : Number(value);
    }
    return value;
  };

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    const processedValue = getProcessedValue(name, value);

    setNewIngredient(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleAutosuggestChange = (event: React.FormEvent<HTMLElement>, { newValue }: Autosuggest.ChangeEvent) => {
    setNewIngredient(prev => ({
      ...prev,
      ingredient: {
        ...prev.ingredient,
        name: newValue,
        amount: prev.ingredient?.amount ?? 0,
        unit: prev.ingredient?.unit ?? '',
        id: prev.ingredient?.id ?? 0
      }
    }));
  };

  const addNewIngredient = async () => {
    if (newIngredient.ingredient?.name && newIngredient.amount !== undefined && newIngredient.unit) {
      const ingredientId = await addIngredient(newIngredient.ingredient.name);
      if (ingredientId) {
        setIngredients(prev => [
          ...prev,
          {
            amount: newIngredient.amount!,
            unit: newIngredient.unit!,
            ingredient: {
              id: ingredientId,
              name: newIngredient.ingredient?.name ?? '',
              amount: newIngredient.amount!,
              unit: newIngredient.unit!,
            }
          }
        ]);
        setNewIngredient({ ingredient: { id: 0, name: '', amount: 0, unit: '' }, amount: 0, unit: '' });
      } else {
        alert('Échec de l\'ajout de l\'ingrédient. Veuillez réessayer.');
      }
    } else {
      alert('Veuillez remplir tous les champs de l\'ingrédient.');
    }
  };

  const getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : existingIngredients.filter(ing =>
      ing.name.toLowerCase().includes(inputValue)
    );
  };

  const getSuggestionValue = (suggestion: Ingredient) => suggestion.name;

  const renderSuggestion = (suggestion: Ingredient) => (
    <div className="p-2 hover:bg-gray-200 cursor-pointer">
      {suggestion.name}
    </div>
  );

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const onSuggestionSelected = (event: React.FormEvent, { suggestion }: { suggestion: Ingredient }) => {
    setNewIngredient(prev => ({
      ...prev,
      ingredient: {
        ...prev.ingredient,
        name: suggestion.name,
        amount: prev.ingredient?.amount ?? 0,
        unit: prev.ingredient?.unit ?? '',
        id: prev.ingredient?.id ?? 0
      }
    }));
  };

  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);

  return (
    <div className="flex space-x-2">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={{
          name: 'name',
          value: newIngredient.ingredient?.name || '',
          onChange: handleAutosuggestChange,
          placeholder: 'Ingrédient',
          className: 'border border-gray-300 rounded-md p-2 flex-1'
        }}
        theme={{
          container: 'relative',
          suggestionsContainer: 'absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full',
          suggestion: 'p-2',
          suggestionHighlighted: 'bg-gray-200'
        }}
      />
      <Input
        name="amount"
        type="number"
        value={newIngredient.amount ?? 0}
        onChange={handleIngredientChange}
        placeholder="Quantité"
        className="flex-1"
      />
      <Select
        name="unit"
        value={newIngredient.unit}
        onValueChange={(value) => handleIngredientChange({ target: { name: 'unit', value } } as React.ChangeEvent<HTMLSelectElement>)}
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
      <Button type="button" onClick={addNewIngredient} disabled={loading}>
        <CirclePlus className="mr-2"/> Ajouter l'ingrédient
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default IngredientForm;