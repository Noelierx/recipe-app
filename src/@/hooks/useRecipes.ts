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
                .select(`
                    *,
                    recipe_ingredients (
                        recipe_id,
                        amount,
                        unit,
                        ingredient:ingredients (name)
                    ),
                    recipe_tags (
                        recipe_id,
                        tag:tags (name)
                    )
                `); // Include prep_time and cook_time in the select

            if (recipesError) throw new Error(recipesError.message);
            if (!recipesData) throw new Error('No recipes found');

            const transformedRecipes: RecipeWithDetails[] = recipesData.map(recipe => {
                const recipeIngredients = recipe.recipe_ingredients || [];
                const recipeTags = recipe.recipe_tags ? recipe.recipe_tags.map((rt: { tag: { name: string } }) => rt.tag) : [];

                return {
                    ...recipe,
                    recipe_ingredients: recipeIngredients,
                    tags: recipeTags,
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
