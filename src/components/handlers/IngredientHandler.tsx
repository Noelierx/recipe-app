import React, { useState } from 'react';
import { CirclePlus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecipeIngredient, Ingredient } from '@/types/types';
import { supabase } from '@/utils/supabaseClient';

interface IngredientHandlerProps {
  ingredients: RecipeIngredient[];
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
}

const IngredientHandler: React.FC<IngredientHandlerProps> = ({ ingredients, setIngredients }) => {
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient & { amount: number }>>({ name: '', amount: 0, unit: '' });

  const getProcessedValue = (name: string, value: string): number | string => {
    if (name === 'amount') {
      return value === '' ? 0 : Number(value);
    }
    return value;
  };

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const processedValue = getProcessedValue(name, value);

    setNewIngredient(prev => ({
      ...prev,
      [name]: processedValue
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
        alert('Échec de l\'ajout de l\'ingrédient. Veuillez réessayer.');
      }
    } else {
      alert('Veuillez remplir tous les champs de l\'ingrédient.');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: string | number) => {
    setIngredients(prev => prev.map((ing, i) => 
      i === index ? { ...ing, [field]: field === 'amount' ? Number(value) : value } : ing
    ));
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
              className="w-20"
            />
            <Input
              value={ing.unit}
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
              className="w-20"
            />
            <Input
              value={ing.ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              className="flex-grow"
            />
            <Button type="button" onClick={() => removeIngredient(index)} variant="destructive" size="sm">
              <Trash2 className="mr-2" /> Retirer l'ingrédient
            </Button>
          </div>
        ))
      ) : (
        <p>Aucun ingrédient ajouté pour le moment.</p>
      )}
      <div className="flex space-x-2">
        <Input
          name="name"
          value={newIngredient.name}
          onChange={handleIngredientChange}
          placeholder="Ingrédient"
        />
        <Input
          name="amount"
          type="number"
          value={newIngredient.amount ?? 0}
          onChange={handleIngredientChange}
          placeholder="Quantité"
        />
        <Input
          name="unit"
          value={newIngredient.unit}
          onChange={handleIngredientChange}
          placeholder="Unité"
        />
        <Button type="button" onClick={addIngredient}>
          <CirclePlus className="mr-2"/> Ajouter l'ingrédient
        </Button>
      </div>
    </div>
  );
}

export default IngredientHandler;