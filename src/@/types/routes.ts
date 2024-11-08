type RouteParams = {
  id: string;
};

export const ROUTES = {
    HOME: '/',
    ADD_RECIPE: '/add-recipe',
    RECIPE_DETAILS: (params: Pick<RouteParams, 'id'>) => `/recipe/${params.id}`,
    EDIT_RECIPE: (params: Pick<RouteParams, 'id'>) => `/recipe/${params.id}/edit`
  } as const;