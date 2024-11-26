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

  const handleAutosuggestChange = (event: React.FormEvent<HTMLElement>, { newValue }: Autosuggest.ChangeEvent) => {
    setNewIngredient(prev => ({
      ...prev,
      name: newValue
    }));
  };

  const addNewIngredient = async () => {
    if (newIngredient.name && newIngredient.amount !== undefined && newIngredient.unit) {
      const ingredientId = await addIngredient(newIngredient.name);
      if (ingredientId) {
        setIngredients(prev => [
          ...prev,
          {
            amount: newIngredient.amount,
            unit: newIngredient.unit,
            ingredient: {
              id: ingredientId,
              name: newIngredient.name,
              amount: newIngredient.amount,
              unit: newIngredient.unit,
            }
          }
        ]);
        setNewIngredient({ name: '', amount: 0, unit: '', id: 0 });
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
      name: suggestion.name
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
          value: newIngredient.name,
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
        value={newIngredient.amount}
        onChange={handleInputChange}
        placeholder="Quantité"
        className="flex-1"
      />
      <Select
        name="unit"
        value={newIngredient.unit}
        onValueChange={(value) => handleSelectChange('unit', value)}
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