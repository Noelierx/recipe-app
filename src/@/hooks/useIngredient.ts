import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Ingredient } from '@/types/RecipeTypes';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const validateIngredient = (data: any): data is Ingredient[] => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    'id' in item && 
    'name' in item && 
    'order' in item
  );
};

const useIngredient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const fetchIngredients = async (retryCount = 0) => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ingredients')
          .select('*')
          .order('order', { ascending: true });
        if (error) throw error;
        if (!validateIngredient(data)) {
          throw new Error('Invalid data format received');
        }
        setIngredients(data);
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => fetchIngredients(retryCount + 1), RETRY_DELAY);
          return;
        }
        setError('Échec de la récupération des ingrédients. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const addIngredient = async (name: string): Promise<number | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .insert([{ name, order: Number }])
        .select('id')
        .single();
      if (error) throw error;
      setIngredients(prev => [...prev, { id: data.id, name, order: 0, amount: 0, unit: '' }]);
      return data.id;
    } catch (error) {
      setError('Échec de l\'ajout de l\'ingrédient. Veuillez réessayer.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateIngredientOrder = async (updatedIngredients: Ingredient[]) => {
    setLoading(true);
    setError(null);
    try {
      const updates = updatedIngredients.map((ingredient, index) => ({
        id: ingredient.id,
        order: index
      }));
      const { error } = await supabase
        .from('ingredients')
        .upsert(updates, { onConflict: 'id' });
      if (error) throw error;
      setIngredients(updatedIngredients);
    } catch (error) {
      setError('Échec de la mise à jour de l\'ordre des ingrédients. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return { ingredients, loading, error, addIngredient, updateIngredientOrder };
};

export default useIngredient;