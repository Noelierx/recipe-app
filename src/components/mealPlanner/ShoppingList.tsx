import React, { useEffect, useState } from 'react';
import { RecipeWithDetails } from '@/types/RecipeTypes';
import { WeeklyPlan } from '@/types/mealPlannerTypes';
import { formatAmount } from '@/utils/formatters';
import { calculateIngredients } from '@/utils/calculateIngredients';

interface ShoppingListProps {
    weeklyPlan: WeeklyPlan;
    recipes: RecipeWithDetails[];
    servingsMap: Record<number, number>;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ weeklyPlan, recipes }) => {
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

    const ingredients = calculateIngredients(weeklyPlan, recipes);

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