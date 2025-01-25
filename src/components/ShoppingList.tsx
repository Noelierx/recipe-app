import React, { useEffect, useState, useCallback } from 'react';
import { RecipeWithDetails, RecipeIngredient } from '@/types/RecipeTypes';
import { DayPlan, WeeklyPlan } from '@/types/mealPlannerTypes';
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

    const addRecipeIngredients = (recipe: RecipeWithDetails, currentIngredients: Set<string>) => {
        recipe.recipe_ingredients?.forEach(ingredient => {
            currentIngredients.add(`${ingredient.ingredient.name}-${ingredient.unit}`);
        });
        recipe.sub_recipes?.forEach(subRecipe => {
            subRecipe.ingredients?.forEach(ingredient => {
                currentIngredients.add(`${ingredient.ingredient.name}-${ingredient.unit}`);
            });
        });
    };

    const getMealsForDay = useCallback((dayPlan: DayPlan, currentIngredients: Set<string>) => {
        Object.values(dayPlan).forEach(meal => {
            if (meal.recipeId) {
                const recipe = recipes.find(r => r.id === meal.recipeId);
                if (recipe) {
                    addRecipeIngredients(recipe, currentIngredients);
                }
            }
        });
    }, [recipes]);

    const getCurrentIngredients = useCallback((weeklyPlan: WeeklyPlan) => {
        const currentIngredients = new Set<string>();
        Object.values(weeklyPlan).forEach(dayPlan => {
            getMealsForDay(dayPlan, currentIngredients);
        });
        return currentIngredients;
    }, [getMealsForDay]);

    const updateCheckedItems = useCallback((currentIngredients: Set<string>) => {
        setCheckedItems(prev => {
            const updatedCheckedItems = { ...prev };
            currentIngredients.forEach(key => {
                if (!(key in updatedCheckedItems)) {
                    updatedCheckedItems[key] = false;
                }
            });
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
    }, [weeklyPlan, getCurrentIngredients, updateCheckedItems]);

    const addIngredientsToMap = (recipe: RecipeWithDetails, ratio: number, ingredientMap: Record<string, { amount: number; unit: string }>) => {
        const addIngredient = (ing: RecipeIngredient) => {
            const key = `${ing.ingredient.name}-${ing.unit}`;
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

    const calculateIngredients = () => {
        const ingredientMap: Record<string, { amount: number; unit: string }> = {};
        Object.values(weeklyPlan).forEach(dayPlan => {
            Object.values(dayPlan).forEach(meal => {
                if (meal.recipeId) {
                    const recipe = recipes.find(r => r.id === meal.recipeId);
                    if (recipe) {
                        const servings = meal.servings || 1;
                        const recipeServings = recipe.servings || 1;
                        const ratio = servings / recipeServings;
                        addIngredientsToMap(recipe, ratio, ingredientMap);
                    }
                }
            });
        });
        return ingredientMap;
    };

    const ingredients = calculateIngredients();

    const handleCheck = (key: string) => {
        setCheckedItems(prev => ({
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
                    const isChecked = checkedItems[key] || false;
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