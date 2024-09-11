import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecipeIngredient, Ingredient } from '@/types/types';
import { supabase } from '@/utils/supabaseClient';

interface IngredientHandlerProps {
  ingredients: RecipeIngredient[];
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
}

const IngredientHandler: React.FC<IngredientHandlerProps> = ({ ingredients, setIngredients }) => {
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient & { amount: number }>>({ name: '', amount: 0, unit: '' });

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  const addIngredient = async () => {
    if (newIngredient.name && newIngredient.amount !== undefined && newIngredient.unit) {
      try {
        const { data, error } = await supabase
          .from('ingredients')
          .select('id')
          .eq('name', newIngredient.name)
          .single();

        let ingredientId: number;
        if (error || !data) {
          const { data: newData, error: insertError } = await supabase
            .from('ingredients')
            .insert({ name: newIngredient.name })
            .select('id')
            .single();

          if (insertError) throw insertError;
          ingredientId = newData.id;
        } else {
          ingredientId = data.id;
        }

        setIngredients(prev => [
          ...prev,
          {
            amount: newIngredient.amount!,
            unit: newIngredient.unit!,
            ingredient: {
              id: ingredientId,
              name: newIngredient.name!,
              amount: newIngredient.amount!,
              unit: newIngredient.unit!,
            }
          }
        ]);
        setNewIngredient({ name: '', amount: 0, unit: '' });
      } catch (error) {
        alert('Failed to add ingredient. Please try again.');
      }
    } else {
      alert('Please fill in all ingredient fields.');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {ingredients.map((ing, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <span>{ing.amount} {ing.unit} {ing.ingredient.name}</span>
          <Button type="button" onClick={() => removeIngredient(index)} variant="destructive" size="sm">Remove</Button>
        </div>
      ))}
      <div className="flex space-x-2">
        <Input
          name="name"
          value={newIngredient.name}
          onChange={handleIngredientChange}
          placeholder="Ingredient name"
        />
        <Input
          name="amount"
          type="number"
          value={newIngredient.amount ?? 0}
          onChange={handleIngredientChange}
          placeholder="Amount"
        />
        <Input
          name="unit"
          value={newIngredient.unit}
          onChange={handleIngredientChange}
          placeholder="Unit"
        />
        <Button type="button" onClick={addIngredient}>Add Ingredient</Button>
      </div>
    </div>
  );
};

export default IngredientHandler;