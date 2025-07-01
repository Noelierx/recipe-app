import React, { useState } from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '@/types/routes';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const navigationItems = [
        {
            label: 'Accueil',
            path: ROUTES.HOME,
            show: !isHomePage
        },
        {
            label: 'Ajouter une recette',
            path: ROUTES.ADD_RECIPE,
            show: !isAddRecipePage
        },
        {
            label: 'Planificateur',
            path: ROUTES.MEAL_PLANNER,
            show: !isMealPlannerPage
        }
    ].filter(item => item.show);

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-gray-800 text-white">
            <div className="container mx-auto px-4 py-3">
                {/* Desktop Header */}
                <div className="flex justify-between items-center">
                    {/* Left side - Home button or logo */}
                    <div className="hidden md:block">
                        {!isHomePage && (
                            <Button
                                onClick={() => navigate(ROUTES.HOME)}
                                variant="outline"
                                className="text-black"
                                size="sm"
                            >
                                Accueil
                            </Button>
                        )}
                    </div>

                    {/* Center - Title */}
                    <h1 className="text-lg md:text-2xl font-bold text-center flex-1 md:flex-none">
                        {title}
                    </h1>

                    {/* Right side - Desktop navigation */}
                    <div className="hidden md:flex gap-2">
                        {!isAddRecipePage && (
                            <Button
                                onClick={() => navigate(ROUTES.ADD_RECIPE)}
                                variant="outline"
                                className="text-black"
                                size="sm"
                            >
                                Ajouter une recette
                            </Button>
                        )}
                        {!isMealPlannerPage && (
                            <Button
                                onClick={() => navigate(ROUTES.MEAL_PLANNER)}
                                variant="outline"
                                className="text-black"
                                size="sm"
                            >
                                Planificateur
                            </Button>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden text-white hover:bg-gray-700"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </Button>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-gray-600">
                        <nav className="flex flex-col space-y-2 pt-4">
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.path}
                                    onClick={() => handleNavigate(item.path)}
                                    variant="ghost"
                                    className="text-white hover:bg-gray-700 justify-start"
                                    size="sm"
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;