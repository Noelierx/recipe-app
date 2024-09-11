import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { RecipeWithDetails } from '@/types/types';

export const useRecipes = () => {
    const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecipes = useCallback(async () => {
        try {
            setLoading(true);
            const { data: recipesData, error: recipesError } = await supabase
                .from('recipes')
                .select('*');

            if (recipesError) throw new Error(recipesError.message);
            if (!recipesData) throw new Error('No recipes found');

            const { data: ingredientsData, error: ingredientsError } = await supabase
                .from('recipe_ingredients')
                .select(`
                    recipe_id,
                    amount,
                    unit,
                    ingredient:ingredients (name)
                `);

            if (ingredientsError) throw new Error(ingredientsError.message);

            const { data: tagsData, error: tagsError } = await supabase
                .from('recipe_tags')
                .select(`
                    recipe_id,
                    tag:tags (name)
                `);

            if (tagsError) throw new Error(tagsError.message);

            const transformedRecipes: RecipeWithDetails[] = recipesData.map(recipe => {
                const recipeIngredients = ingredientsData
                    ? ingredientsData.filter(ri => ri.recipe_id === recipe.id)
                    : [];
                const recipeTags = tagsData
                    ? tagsData.filter(rt => rt.recipe_id === recipe.id)
                    : [];

                return {
                    ...recipe,
                    recipe_ingredients: recipeIngredients,
                    tags: recipeTags.map(rt => rt.tag)
                };
            });

            setRecipes(transformedRecipes);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    return { recipes, loading, error, fetchRecipes };
};