import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isHomePage = location.pathname === '/';
    const isAddRecipePage = location.pathname === '/add-recipe';

    const title = location.pathname.includes('/recipe/') ? 'Détails de la recette' : 
                  location.pathname === '/add-recipe' ? 'Ajouter une recette' : 
                  location.pathname === '/edit-recipe' ? 'Modifier la recette' : 
                  'Liste des recettes';

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