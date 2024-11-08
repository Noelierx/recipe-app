export const ROUTES = {
    HOME: '/',
    ADD_RECIPE: '/add-recipe',
    RECIPE_DETAILS: (id: string) => `/recipe/${id}`,
    EDIT_RECIPE: (id: string) => `/recipe/${id}/edit`
  } as const;