import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Ingredient } from '@/types/RecipeTypes';

const useIngredient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ingredients')
          .select('*');
        if (error) throw error;
        setIngredients(data);
      } catch (error) {
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
        .select('id')
        .eq('name', name)
        .single();

      if (error || !data) {
        const { data: newData, error: insertError } = await supabase
          .from('ingredients')
          .insert({ name })
          .select('id')
          .single();

        if (insertError) throw insertError;
        return newData.id;
      } else {
        return data.id;
      }
    } catch (error) {
      setError('Échec de l\'ajout de l\'ingrédient. Veuillez réessayer.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { addIngredient, ingredients, loading, error };
};

export default useIngredient;