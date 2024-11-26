import React, { useState, useEffect, useCallback } from 'react';
import { RecipeWithDetails } from '@/types/RecipeTypes';
import { WeeklyPlan, DayPlan } from '@/types/mealPlannerTypes';
import { formatAmount } from '@/utils/formatters';

interface ShoppingListProps {
    weeklyPlan: WeeklyPlan;
    recipes: RecipeWithDetails[];
    servingsMap: Record<number, number>;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ weeklyPlan, recipes, servingsMap }) => {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('checkedItems');
        if (!saved) return {};
        try {
            const parsed = JSON.parse(saved);
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch (e) {
            console.error('Failed to parse checkedItems from localStorage:', e);
            return {};
        }
    });

    useEffect(() => {
        localStorage.setItem('checkedItems', JSON.stringify(checkedItems));
    }, [checkedItems]);

    const addRecipeIngredients = useCallback((recipe: RecipeWithDetails, currentIngredients: Set<string>) => {
        recipe.recipe_ingredients?.forEach(ing => {
            currentIngredients.add(ing.ingredient.name);
        });
        recipe.sub_recipes?.forEach(subRecipe => {
            subRecipe.ingredients?.forEach(ing => {
                currentIngredients.add(ing.ingredient.name);
            });
        });
    }, []);

    const getMealsForDay = (dayPlan: DayPlan, currentIngredients: Set<string>) => {
        Object.values(dayPlan).forEach(meal => {
            if (meal.recipeId) {
                const recipe = recipes.find(r => r.id === meal.recipeId);
                if (recipe) {
                    addRecipeIngredients(recipe, currentIngredients);
                }
            }
        });
    };

    const getCurrentIngredients = useCallback((weeklyPlan: WeeklyPlan) => {
        const currentIngredients = new Set<string>();
        Object.values(weeklyPlan).forEach(dayPlan => {
            getMealsForDay(dayPlan, currentIngredients);
        });
        return currentIngredients;
    }, [recipes, addRecipeIngredients]);

    const updateCheckedItems = useCallback((currentIngredients: Set<string>) => {
        setCheckedItems(prev => {
            const updatedCheckedItems = { ...prev };
            Object.keys(updatedCheckedItems).forEach(key => {
                if (!currentIngredients.has(key)) {
                    delete updatedCheckedItems[key];
                }
            });
            return updatedCheckedItems;
        });
    }, []);

    useEffect(() => {
        const currentIngredients = getCurrentIngredients(weeklyPlan);
        updateCheckedItems(currentIngredients);
    }, [weeklyPlan, recipes, getCurrentIngredients, updateCheckedItems]);

    const addIngredientsToMap = (recipe: RecipeWithDetails, ratio: number, ingredientMap: Record<string, { amount: number; unit: string }>) => {
        const addIngredient = (ing: any) => {
            const key = ing.ingredient.name;
            if (!ingredientMap[key]) {
                ingredientMap[key] = { amount: 0, unit: ing.unit };
            }
            ingredientMap[key].amount += ing.amount * ratio;
        };

        recipe.recipe_ingredients?.forEach(addIngredient);
        recipe.sub_recipes?.forEach(subRecipe => {
            subRecipe.ingredients?.forEach(addIngredient);
        });
    };

    const processMeal = (meal: any, ingredientMap: Record<string, { amount: number; unit: string }>) => {
        if (meal.recipeId) {
            const recipe = recipes.find(r => r.id === meal.recipeId);
            if (recipe) {
                if (!recipe.servings) {
                    console.error(`Recipe ${recipe.id} has invalid servings`);
                    return;
                }
                const servings = servingsMap[meal.recipeId] || recipe.servings;
                const ratio = servings / recipe.servings;

                addIngredientsToMap(recipe, ratio, ingredientMap);
            }
        }
    };

    const calculateIngredients = () => {
        const ingredientMap: Record<string, { amount: number; unit: string }> = {};
        Object.values(weeklyPlan).forEach(dayPlan => {
            Object.values(dayPlan).forEach(meal => {
                processMeal(meal, ingredientMap);
            });
        });
        return ingredientMap;
    };

    const ingredients = calculateIngredients();

    const handleCheck = (key: string) => {
        setCheckedItems((prev: Record<string, boolean>) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="border rounded-lg m-4 p-4 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Liste de courses</h2>
            <ul className="space-y-2">
                {Object.entries(ingredients).map(([key, { amount, unit }]) => {
                    const ingredientName = key.split('-')[0];
                    const isChecked = checkedItems[key];
                    return (
                        <li key={key} className="flex justify-between items-center">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheck(key)}
                                className="mr-2"
                            />
                            <div className={`flex-1 ${isChecked ? 'line-through' : ''} flex justify-between`}>
                                <span>{ingredientName}</span>
                                <span className="ml-auto">{formatAmount(amount)} {unit}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ShoppingList;