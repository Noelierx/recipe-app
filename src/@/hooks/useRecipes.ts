import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { RecipeWithDetails } from '@/types/types';

export const useRecipes = () => {
    const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleFetchErrors = (recipesError: any, recipesData: any) => {
        if (recipesError) throw new Error(recipesError.message);
        if (!recipesData) throw new Error('No recipes found');
    };

    const transformRecipeData = (recipesData: any): RecipeWithDetails[] => {
        return recipesData.map((recipe: RecipeWithDetails) => {
            const recipeIngredients = recipe.recipe_ingredients || [];
            const recipeTags = recipe.tags?.map((tag: { name: string }) => tag.name) || [];

            return {
                ...recipe,
                recipe_ingredients: recipeIngredients,
                tags: recipeTags,
            };
        });
    };

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
                `);

            handleFetchErrors(recipesError, recipesData);

            const transformedRecipes = transformRecipeData(recipesData);

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
