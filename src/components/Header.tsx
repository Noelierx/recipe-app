import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isRecipeDetailPage = location.pathname.includes('/recipe/');
    const isAddRecipePage = location.pathname === '/add-recipe';

    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    {isRecipeDetailPage && (
                        <Button
                            onClick={handleBack}
                            variant="outline"
                            className="text-white"
                            aria-label="Go back to the previous page"
                        >
                            Back
                        </Button>
                    )}
                </div>
                <h1 className="text-2xl font-bold">
                    {isRecipeDetailPage ? 'Recipe Detail' : isAddRecipePage ? 'Add Recipe' : 'Recipe List'}
                </h1>
                <div>
                    {!isAddRecipePage && (
                        <Button
                            onClick={() => navigate('/add-recipe')}
                            variant="outline"
                            className="text-white"
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