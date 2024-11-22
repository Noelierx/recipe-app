export const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const;
export const MEAL_TYPES = ['matin', 'midi', 'soir'] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
export type MealType = typeof MEAL_TYPES[number];

export interface MealSlot {
    recipeId: string | null;
    recipeName: string | null;
}

export interface DayPlan {
    matin: MealSlot;
    midi: MealSlot;
    soir: MealSlot;
}

export type WeeklyPlan = Record<DayOfWeek, DayPlan>;