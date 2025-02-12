import React, { useEffect, useState } from 'react';
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

    const addIngredientsToMap = (recipe: RecipeWithDetails, ratio: number, ingredientMap: Record<string, { amount: number; unit: string }>) => {
        const addIngredient = (ingredient: RecipeIngredient) => {
            const key = `${ingredient.ingredient.name}-${ingredient.unit}`;
            if (!ingredientMap[key]) {
                ingredientMap[key] = { amount: 0, unit: ingredient.unit };
            }
            ingredientMap[key].amount += ingredient.amount * ratio;
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
                const servings = meal.servings || 1;
                const recipeServings = recipe.servings || 1;
                const ratio = servings / recipeServings;
                addIngredientsToMap(recipe, ratio, ingredientMap);
            }
        }
    };

    const processDayPlan = (dayPlan: DayPlan, ingredientMap: Record<string, { amount: number; unit: string }>) => {
        Object.values(dayPlan).forEach(meal => {
            processMeal(meal, ingredientMap);
        });
    };

    const calculateIngredients = () => {
        const ingredientMap: Record<string, { amount: number; unit: string }> = {};
        Object.values(weeklyPlan).forEach(dayPlan => {
            processDayPlan(dayPlan, ingredientMap);
        });
        return ingredientMap;
    };

    const ingredients = calculateIngredients();

    const handleCheck = (key: string) => {
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
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