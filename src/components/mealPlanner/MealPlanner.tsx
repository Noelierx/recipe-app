import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/ui/copyButton";
import { RecipeWithDetails } from '@/types/RecipeTypes';
import { DAYS_OF_WEEK, MEAL_TYPES, WeeklyPlan, DayPlan, MealSlot } from '@/types/mealPlannerTypes';
import ShoppingList from './ShoppingList';
import SelectedMeals from './SelectedMeals';
import { formatAmount } from '@/utils/formatters';
import { calculateIngredients, calculateSelectedMeals } from '@/utils/mealPlannerUtils';

interface MealPlannerProps {
    recipes: RecipeWithDetails[];
}

interface MealCellProps {
    meal: MealSlot;
    recipes: RecipeWithDetails[];
    onRecipeSelect: (value: string) => void;
    onServingsChange: (servings: number) => void;
    onRemoveMeal: () => void;
    mobileLayout?: boolean;
}

const MealCell: React.FC<MealCellProps> = ({ 
    meal, 
    recipes, 
    onRecipeSelect, 
    onServingsChange, 
    onRemoveMeal,
    mobileLayout = false 
}) => {
    const comboboxItems = recipes.map(recipe => ({
        label: recipe.title,
        value: recipe.id.toString()
    }));

    const renderItem = (item: { label: string; value: string }) => (
        <div className="flex items-center justify-between">
            <span className="flex-1">{item.label}</span>
        </div>
    );

    const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.floor(Number(e.target.value));
        if (value >= 1 && value <= 99) {
            onServingsChange(value);
        }
    };

    if (meal.recipeName) {
        return (
            <div className={mobileLayout ? "space-y-2" : "flex items-center gap-2"}>
                <div className={`text-sm ${mobileLayout ? 'font-medium' : ''}`}>
                    {meal.recipeName}
                </div>
                <div className={`flex items-center gap-2 ${mobileLayout ? '' : 'ml-auto'}`}>
                    <Input
                        type="number"
                        value={meal.servings}
                        onChange={handleServingsChange}
                        min="1"
                        max="99"
                        step="1"
                        className={mobileLayout ? "w-16 h-8" : "w-16"}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRemoveMeal}
                        className={mobileLayout ? "h-8 w-8 p-0" : ""}
                    >
                        ×
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Combobox
            items={comboboxItems}
            onSelect={onRecipeSelect}
            placeholder="Ajouter recette"
            renderItem={renderItem}
        />
    );
};

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
                const validServings = Math.max(1, meal.servings ?? 1);
                acc[recipeId] = (acc[recipeId] ?? 0) + validServings;
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

    const getTextToCopy = () => {
        const mealServingsMap = calculateSelectedMeals(weeklyPlan, recipes);

        const selectedMealsText = Object.entries(mealServingsMap).map(([mealName, { servings }]) => {
            return `${mealName}: ${servings} portions`;
        }).join('\n');

        const ingredientMap = calculateIngredients(weeklyPlan, recipes);

        const shoppingListText = Object.entries(ingredientMap).map(([key, { amount, unit }]) => {
            const ingredientName = key.split('-')[0];
            return `${ingredientName}: ${formatAmount(amount)} ${unit}`;
        }).join('\n');

        return `Repas sélectionnés:\n${selectedMealsText}\n\nListe de courses:\n${shoppingListText}`;
    };

    return (
        <div className="container mx-auto p-4">
            {recipes.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Aucune recette disponible. Ajoutez des recettes pour commencer à planifier vos repas !</p>
                </div>
            ) : (
                <>
                    {/* Mobile: Horizontal scrolling layout */}
                    <div className="md:hidden">
                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day} className="border rounded-lg p-3 min-w-[280px] flex-shrink-0">
                                    <h3 className="font-semibold mb-3 text-center">{day}</h3>
                                    {MEAL_TYPES.map(mealType => (
                                        <div key={`${day}-${mealType}`} className="mb-3">
                                            <p className="text-sm text-gray-600 capitalize mb-1">{mealType}</p>
                                            <MealCell
                                                meal={weeklyPlan[day][mealType]}
                                                recipes={recipes}
                                                onRecipeSelect={(value: string) => handleRecipeSelect(value, day, mealType)}
                                                onServingsChange={(servings: number) => handleServingsChange(day, mealType, servings)}
                                                onRemoveMeal={() => removeMealAssignment(day, mealType)}
                                                mobileLayout={true}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Grid layout */}
                    <div className="hidden md:grid md:grid-cols-7 gap-4">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">{day}</h3>
                                {MEAL_TYPES.map(mealType => (
                                    <div key={`${day}-${mealType}`} className="mb-2">
                                        <p className="text-sm text-gray-600 capitalize">{mealType}</p>
                                        <MealCell
                                            meal={weeklyPlan[day][mealType]}
                                            recipes={recipes}
                                            onRecipeSelect={(value: string) => handleRecipeSelect(value, day, mealType)}
                                            onServingsChange={(servings: number) => handleServingsChange(day, mealType, servings)}
                                            onRemoveMeal={() => removeMealAssignment(day, mealType)}
                                            mobileLayout={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ShoppingList weeklyPlan={weeklyPlan} recipes={recipes} servingsMap={servingsMap} />
                <SelectedMeals weeklyPlan={weeklyPlan} recipes={recipes} />
            </div>
            <CopyButton textToCopy={getTextToCopy()} buttonText="Copier toutes les informations" copyType="text" />
        </div>
    );
};

export default MealPlanner;