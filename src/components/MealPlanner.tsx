import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeWithDetails } from '@/types/RecipeTypes';
import { DAYS_OF_WEEK, MEAL_TYPES, WeeklyPlan, DayPlan } from '@/types/mealPlannerTypes';

interface MealPlannerProps {
    recipes: RecipeWithDetails[];
}

const initialDayPlan: DayPlan = {
    'matin': { recipeId: null, recipeName: null },
    'midi': { recipeId: null, recipeName: null },
    'soir': { recipeId: null, recipeName: null }
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
        }), {});
    });

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
                    recipeName: recipe.title
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
                    recipeName: null
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMealAssignment(day, mealType)}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ) : (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    Ajouter une recette
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Sélectionner une recette pour {day} {mealType}</DialogTitle>
                                                </DialogHeader>
                                                <Select onValueChange={(value) => handleRecipeSelect(value, day, mealType)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choisir une recette" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {recipes.map(recipe => (
                                                            <SelectItem key={recipe.id} value={recipe.id.toString()}>
                                                                {recipe.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MealPlanner;