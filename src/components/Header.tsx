import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/types/routes';
import { TITLES } from '@/types/translations'

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isHomePage = location.pathname === '/';
    const isAddRecipePage = location.pathname === '/add-recipe';

    const getTitle = (pathname: string): string => {
        if (pathname.includes(ROUTES.RECIPE_DETAILS)) {
            return TITLES.recipe_details;
        } else if (pathname === ROUTES.ADD_RECIPE) {
            return TITLES.add_recipe;
        } else if (pathname === ROUTES.EDIT_RECIPE) {
            return TITLES.edit_recipe;
        } else {
            return TITLES.recipe_list;
        }
    };

    const title = getTitle(location.pathname);

    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    {!isHomePage && (
                        <Button
                            onClick={() => navigate('/')}
                            variant="outline"
                            className="text-black"
                            aria-label="Aller à l'accueil"
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
                            onClick={() => navigate('/add-recipe')}
                            variant="outline"
                            className="text-black"
                            aria-label="Ajouter une recette"
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