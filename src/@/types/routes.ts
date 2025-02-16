export const ROUTES = {
  HOME: '/',
  RECIPE_DETAILS: ({ id }: { id: string }) => `/recipe/${id}`,
  ADD_RECIPE: '/add-recipe',
  EDIT_RECIPE: ({ id }: { id: string }) => `/edit-recipe/${id}`,
  MEAL_PLANNER: '/meal-planner',
};