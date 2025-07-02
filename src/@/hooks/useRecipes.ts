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

    const mergeSubRecipeIngredients = (mainIngredients: any[], subRecipeIngredients: any[]) => {
        subRecipeIngredients.forEach((sri: any) => {
            const existingIngredient = mainIngredients.find(
                (ing) => ing.ingredient.name === sri.ingredient.name && ing.unit === sri.unit
            );
            if (existingIngredient) {
                existingIngredient.amount += sri.amount;
            } else {
                mainIngredients.push({
                    amount: sri.amount,
                    unit: sri.unit,
                    ingredient: sri.ingredient,
                });
            }
        });
    };

return recipeSubRecipes
    .filter(rsr => rsr.sub_recipe)
    .map(rsr => {
        const sr = rsr.sub_recipe;
        return {
            ...sr,
            ingredients: (sr.sub_recipe_ingredients ?? []).map((sri: any) => ({
                amount: sri.amount,
                unit: sri.unit,
                ingredient: sri.ingredient,
            })),
        };
    });

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
                    recipe_sub_recipes (
                        sub_recipe:sub_recipes (
                            id,
                            title,
                            instructions,
                            sub_recipe_ingredients (
                                amount,
                                unit,
                                ingredient:ingredients (id, name)
                            )
                        )
                    )
                `);

            handleFetchErrors(recipesError, recipesData);

            const transformedRecipes: RecipeWithDetails[] = (recipesData ?? []).map((recipe: any) => {
                const recipeIngredients = recipe.recipe_ingredients ?? [];
                const recipeTags = recipe.recipe_tags ? recipe.recipe_tags.map((rt: { tag: { name: string } }) => rt.tag) : [];
                const recipeSubRecipes = recipe.recipe_sub_recipes ?? [];

                const allIngredients = [...recipeIngredients];
                recipeSubRecipes.forEach((rsr: any) => {
                    if (rsr.sub_recipe?.sub_recipe_ingredients) {
                        mergeSubRecipeIngredients(allIngredients, rsr.sub_recipe.sub_recipe_ingredients);
                    }
                });

                return {
                    ...recipe,
                    recipe_ingredients: allIngredients,
                    tags: recipeTags,
                    sub_recipes: transformSubRecipes(recipeSubRecipes),
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