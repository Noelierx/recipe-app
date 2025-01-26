import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { RecipeWithDetails } from '@/types/RecipeTypes';

export const useRecipes = () => {
    const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleFetchErrors = (recipesError: any, recipesData: any) => {
        if (recipesError) throw new Error(recipesError.message);
        if (!recipesData) throw new Error('No recipes found');
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
                    ),
                    sub_recipes (
                        id,
                        title,
                        instructions,
                        sub_recipe_ingredients (
                            amount,
                            unit,
                            ingredient:ingredients (id, name)
                        )
                    )
                `);

            handleFetchErrors(recipesError, recipesData);

            const transformedRecipes: RecipeWithDetails[] = (recipesData || []).map(recipe => {
                const recipeIngredients = recipe.recipe_ingredients || [];
                const recipeTags = recipe.recipe_tags ? recipe.recipe_tags.map((rt: { tag: { name: string } }) => rt.tag) : [];
                const subRecipes = recipe.sub_recipes || [];

                const allIngredients = [...recipeIngredients];

                subRecipes.forEach((subRecipe: any) => {
                    subRecipe.sub_recipe_ingredients.forEach((sri: any) => {
                        const existingIngredient = allIngredients.find(
                            (ing) => ing.ingredient.name === sri.ingredient.name && ing.unit === sri.unit
                        );
                        if (existingIngredient) {
                            existingIngredient.amount += sri.amount;
                        } else {
                            allIngredients.push({
                                amount: sri.amount,
                                unit: sri.unit,
                                ingredient: sri.ingredient,
                            });
                        }
                    });
                });

                return {
                    ...recipe,
                    recipe_ingredients: allIngredients,
                    tags: recipeTags,
                    sub_recipes: subRecipes.map((sr: any) => ({
                        ...sr,
                        ingredients: sr.sub_recipe_ingredients.map((sri: any) => ({
                            amount: sri.amount,
                            unit: sri.unit,
                            ingredient: sri.ingredient,
                        })),
                    })),
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