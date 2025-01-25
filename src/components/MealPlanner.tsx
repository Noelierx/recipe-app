import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { RecipeWithDetails } from '@/types/RecipeTypes';
import { DAYS_OF_WEEK, MEAL_TYPES, WeeklyPlan, DayPlan } from '@/types/mealPlannerTypes';
import ShoppingList from './ShoppingList';

interface MealPlannerProps {
    recipes: RecipeWithDetails[];
}

const initialDayPlan: DayPlan = {
    'matin': { recipeId: null, recipeName: null, servings: 1 },
    'midi': { recipeId: null, recipeName: null, servings: 1 },
    'soir': { recipeId: null, recipeName: null, servings: 1 }
};

const MealPlanner: React.FC<MealPlannerProps> = ({ recipes }) => {
    const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
        const savedPlan = localStorage.getItem('weeklyMealPlan');
        if (savedPlan) {
            return JSON.parse(savedPlan);
        }
        return DAYS_OF_WEEK.reduce((acc, day) => ({
            ...acc,
            [day]: { ...initialDayPlan }
        }), {} as WeeklyPlan);
    });

    const servingsMap = Object.entries(weeklyPlan).reduce((acc, [day, meals]) => {
        MEAL_TYPES.forEach(mealType => {
            const meal = meals[mealType];
            const recipeId = Number(meal.recipeId);
            if (meal.recipeId && !Number.isNaN(recipeId)) {
                const validServings = Math.max(1, meal.servings || 1);
                acc[recipeId] = (acc[recipeId] || 0) + validServings;
            }
        });
        return acc;
    }, {} as { [key: number]: number });

    useEffect(() => {
        localStorage.setItem('weeklyMealPlan', JSON.stringify(weeklyPlan));
    }, [weeklyPlan]);

    const handleRecipeSelect = (value: string, day: keyof WeeklyPlan, mealType: keyof DayPlan) => {
        const recipe = recipes.find(r => r.id === parseInt(value));
        if (recipe) {
            handleMealAssignment(day, mealType, recipe);
        }
    };

    const handleMealAssignment = (day: keyof WeeklyPlan, mealType: keyof DayPlan, recipe: RecipeWithDetails) => {
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [mealType]: {
                    recipeId: recipe.id,
                    recipeName: recipe.title,
                    servings: 1
                }
            }
        }));
    };

    const removeMealAssignment = (day: keyof WeeklyPlan, mealType: keyof DayPlan) => {
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [mealType]: {
                    recipeId: null,
                    recipeName: null,
                    servings: 1
                }
            }
        }));
    };

    const handleServingsChange = (day: keyof WeeklyPlan, mealType: keyof DayPlan, servings: number) => {
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [mealType]: {
                    ...prev[day][mealType],
                    servings: servings > 0 ? servings : 1
                }
            }
        }));
    };

    return (
        <div className="container mx-auto p-4">
            {recipes.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Aucune recette disponible. Ajoutez des recettes pour commencer à planifier vos repas !</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} className="border rounded-lg p-4">
                            <h3 className="font-semibold mb-2">{day}</h3>
                            {MEAL_TYPES.map(mealType => (
                                <div key={`${day}-${mealType}`} className="mb-2">
                                    <p className="text-sm text-gray-600 capitalize">{mealType}</p>
                                    {weeklyPlan[day][mealType].recipeName ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">
                                                {weeklyPlan[day][mealType].recipeName}
                                            </span>
                                            <Input
                                                type="number"
                                                value={weeklyPlan[day][mealType].servings}
                                                onChange={(e) => {
                                                    const value = Math.floor(Number(e.target.value));
                                                    if (value >= 1 && value <= 99) {
                                                        handleServingsChange(day, mealType, value);
                                                    }
                                                }}
                                                min="1"
                                                max="99"
                                                step="1"
                                                className="w-16"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMealAssignment(day, mealType)}
                                                className="ml-auto"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ) : (
                                        <Combobox
                                            items={recipes.map(recipe => ({
                                                label: recipe.title,
                                                value: recipe.id.toString()
                                            }))}
                                            onSelect={(value: string) => {
                                                handleRecipeSelect(value, day, mealType);
                                            }}
                                            placeholder="Ajouter recette"
                                            renderItem={(item: { label: string; value: string }) => (
                                                <div className="flex items-center justify-between">
                                                    <span className="flex-1">{item.label}</span>
                                                </div>
                                            )}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
            <ShoppingList weeklyPlan={weeklyPlan} recipes={recipes} servingsMap={servingsMap} />
        </div>
    );
};

export default MealPlanner;