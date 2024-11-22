import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { Tag } from '@/types/RecipeTypes';

export const useGetTags = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTags = useCallback(async (): Promise<Tag[]> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw new Error(`Error fetching tags: ${error.message}`);
      return data as Tag[];
    } catch (err) {
      console.error('Error in getTags:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { getTags, loading, error };
};