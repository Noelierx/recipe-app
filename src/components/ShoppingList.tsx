import React, { useState, useEffect } from 'react';
import { RecipeWithDetails } from '@/types/RecipeTypes';
import { WeeklyPlan } from '@/types/mealPlannerTypes';
import { formatAmount } from '@/utils/formatters';

interface ShoppingListProps {
    weeklyPlan: WeeklyPlan;
    recipes: RecipeWithDetails[];
    servingsMap: Record<number, number>;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ weeklyPlan, recipes, servingsMap }) => {
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('checkedItems');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('checkedItems', JSON.stringify(checkedItems));
    }, [checkedItems]);

    useEffect(() => {
        const currentIngredients = new Set<string>();
        Object.values(weeklyPlan).forEach(dayPlan => {
            Object.values(dayPlan).forEach(meal => {
                if (meal.recipeId) {
                    const recipe = recipes.find(r => r.id === meal.recipeId);
                    if (recipe) {
                        recipe.recipe_ingredients?.forEach(ing => {
                            currentIngredients.add(ing.ingredient.name);
                        });
                        recipe.sub_recipes?.forEach(subRecipe => {
                            subRecipe.ingredients?.forEach(ing => {
                                currentIngredients.add(ing.ingredient.name);
                            });
                        });
                    }
                }
            });
        });

        setCheckedItems(prev => {
            const updatedCheckedItems = { ...prev };
            Object.keys(updatedCheckedItems).forEach(key => {
                if (!currentIngredients.has(key)) {
                    delete updatedCheckedItems[key];
                }
            });
            return updatedCheckedItems;
        });
    }, [weeklyPlan, recipes]);

    const calculateIngredients = () => {
        const ingredientMap: Record<string, { amount: number; unit: string }> = {};
        
        Object.values(weeklyPlan).forEach(dayPlan => {
            Object.values(dayPlan).forEach(meal => {
                if (meal.recipeId) {
                    const recipe = recipes.find(r => r.id === meal.recipeId);
                    if (recipe) {
                        const servings = servingsMap[meal.recipeId] || recipe.servings;
                        const ratio = servings / recipe.servings;
    
                        recipe.recipe_ingredients?.forEach(ing => {
                            const key = ing.ingredient.name;
                            if (!ingredientMap[key]) {
                                ingredientMap[key] = { amount: 0, unit: ing.unit };
                            }
                            ingredientMap[key].amount += ing.amount * ratio;
                        });
    
                        recipe.sub_recipes?.forEach(subRecipe => {
                            subRecipe.ingredients?.forEach(ing => {
                                const key = ing.ingredient.name;
                                if (!ingredientMap[key]) {
                                    ingredientMap[key] = { amount: 0, unit: ing.unit };
                                }
                                ingredientMap[key].amount += ing.amount * ratio;
                            });
                        });
                    }
                }
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