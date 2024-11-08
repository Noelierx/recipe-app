import React from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/types/routes';
import { TITLES } from '@/types/translations'

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isHomePage = location.pathname === ROUTES.HOME;
    const isAddRecipePage = location.pathname === ROUTES.ADD_RECIPE;

    const getTitle = (): string => {
        const routeToTitleMap: { [key: string]: string } = {
          [ROUTES.ADD_RECIPE]: TITLES.add_recipe,
          [ROUTES.RECIPE_DETAILS(':id')]: TITLES.recipe_details,
          [ROUTES.EDIT_RECIPE(':id')]: TITLES.edit_recipe,
        };
      
        for (const route in routeToTitleMap) {
          if (matchPath(route, location.pathname)) {
            return routeToTitleMap[route];
          }
        }
      
        return TITLES.recipe_list;
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
                <div>
                    {!isAddRecipePage && (
                        <Button
                            onClick={() => navigate(ROUTES.ADD_RECIPE)}
                            variant="outline"
                            className="text-black"
                        >
                            Ajouter une recette
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;