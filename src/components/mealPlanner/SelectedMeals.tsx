import React from 'react';
import { Link } from 'react-router-dom';
import { WeeklyPlan } from '@/types/mealPlannerTypes';
import { RecipeWithDetails } from '@/types/RecipeTypes';

interface SelectedMealsProps {
    weeklyPlan: WeeklyPlan;
    recipes: RecipeWithDetails[];
}

const SelectedMeals: React.FC<SelectedMealsProps> = ({ weeklyPlan, recipes }) => {
    const mealServingsMap: Record<string, { servings: number, recipeId: number }> = {};

    Object.values(weeklyPlan).forEach(dayPlan => {
        Object.values(dayPlan).forEach(meal => {
            if (meal.recipeId) {
                const recipe = recipes.find(r => r.id === meal.recipeId);
                if (recipe) {
                    const key = recipe.title;
                    if (!mealServingsMap[key]) {
                        mealServingsMap[key] = { servings: 0, recipeId: recipe.id };
                    }
                    mealServingsMap[key].servings += meal.servings;
                }
            }
        });
    });

    return (
        <div className="border rounded-lg m-4 p-4 max-w-md">
            <h2 className="text-2xl font-bold mb-4">Repas sélectionnés</h2>
            <ul className="space-y-2">
                {Object.entries(mealServingsMap).map(([mealName, { servings, recipeId }]) => (
                    <li key={mealName} className="flex justify-between items-center">
                        <Link to={`/recipe/${recipeId}`}>
                            {mealName}
                        </Link>
                        <span className="ml-auto">{servings} portions</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SelectedMeals;