import { RecipeWithDetails, RecipeIngredient } from '@/types/RecipeTypes';
import { WeeklyPlan, DayPlan } from '@/types/mealPlannerTypes';
import { Unit } from '@/constants';
import { convertUnit } from '@/utils/unitConverter';

export const calculateIngredients = (weeklyPlan: WeeklyPlan, recipes: RecipeWithDetails[]) => {
    const ingredientMap: Record<string, { amount: number; unit: Unit }> = {};

    const addIngredientsToMap = (recipe: RecipeWithDetails, ratio: number) => {
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

    const processMeal = (meal: any) => {
        if (meal.recipeId) {
            const recipe = recipes.find(r => r.id === meal.recipeId);
            if (recipe) {
                const servings = meal.servings || 1;
                const recipeServings = recipe.servings || 1;
                const ratio = servings / recipeServings;
                addIngredientsToMap(recipe, ratio);
            }
        }
    };

    const processDayPlan = (dayPlan: DayPlan) => {
        Object.values(dayPlan).forEach(meal => {
            processMeal(meal);
        });
    };

    Object.values(weeklyPlan).forEach(dayPlan => {
        processDayPlan(dayPlan);
    });

    Object.keys(ingredientMap).forEach(key => {
        const { amount, unit } = ingredientMap[key];
        const converted = convertUnit(amount, unit);
        ingredientMap[key] = converted;
    });

    return ingredientMap;
};

export const calculateSelectedMeals = (weeklyPlan: WeeklyPlan, recipes: RecipeWithDetails[]) => {
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

    return mealServingsMap;
};