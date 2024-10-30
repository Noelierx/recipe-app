import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isHomePage = location.pathname === '/';
    const isAddRecipePage = location.pathname === '/add-recipe';

    const pageTitle = (() => {
        if (location.pathname.includes('/recipe/')) return 'Recipe Detail';
        if (location.pathname === '/add-recipe') return 'Add Recipe';
        if (location.pathname === '/edit-recipe') return 'Edit Recipe';
        return 'Recipe List';
    })();

    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    {!isHomePage && (
                        <Button
                            onClick={() => navigate('/')}
                            variant="outline"
                            className="text-black"
                            aria-label="Go to home page"
                        >
                            Home
                        </Button>
                    )}
                </div>
                <h1 className="text-2xl font-bold">
                    {pageTitle}
                </h1>
                <div>
                    {!isAddRecipePage && (
                        <Button
                            onClick={() => navigate('/add-recipe')}
                            variant="outline"
                            className="text-black"
                            aria-label="Go to Add Recipe page"
                        >
                            Add Recipe
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;