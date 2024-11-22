import React from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/types/routes';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === ROUTES.HOME;
    const isAddRecipePage = location.pathname === ROUTES.ADD_RECIPE;
    const isMealPlannerPage = location.pathname === ROUTES.MEAL_PLANNER;

    const getTitle = (): string => {
        const routeToTitleMap: { [key: string]: string } = {
          [ROUTES.ADD_RECIPE]: 'Ajouter une recette',
          [ROUTES.RECIPE_DETAILS({ id: ':id' })]: 'Détails de la recette',
          [ROUTES.EDIT_RECIPE({ id: ':id' })]: 'Modifier la recette',
          [ROUTES.MEAL_PLANNER]: 'Planificateur de repas',
        };
    
        for (const route in routeToTitleMap) {
          if (matchPath(route, location.pathname)) {
            return routeToTitleMap[route];
          }
        }
    
        return 'Liste des recettes';
      };
    
      const title = getTitle();

    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    {!isHomePage && (
                        <Button
                            onClick={() => navigate(ROUTES.HOME)}
                            variant="outline"
                            className="text-black"
                        >
                            Accueil
                        </Button>
                    )}
                </div>
                <h1 className="text-2xl font-bold">
                    {title}
                </h1>
                <div className="flex gap-2">
                    {!isAddRecipePage && (
                        <Button
                            onClick={() => navigate(ROUTES.ADD_RECIPE)}
                            variant="outline"
                            className="text-black"
                        >
                            Ajouter une recette
                        </Button>
                    )}
                    {!isMealPlannerPage && (
                        <Button
                            onClick={() => navigate(ROUTES.MEAL_PLANNER)}
                            variant="outline"
                            className="text-black"
                        >
                            Planificateur
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;