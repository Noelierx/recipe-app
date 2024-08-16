import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isRecipeDetailPage = location.pathname.includes('/recipe/');

    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                {isRecipeDetailPage && (
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="text-white"
                    >
                        Back
                    </Button>
                )}
                <h1 className="text-2xl font-bold">
                    {isRecipeDetailPage ? 'Recipe Detail' : 'Recipe List'}
                </h1>
                {/* Empty div to keep space for the back button */}
                <div></div>
            </div>
        </header>
    );
};

export default Header;