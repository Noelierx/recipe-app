import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { RecipeWithDetails } from '@/types/types';

interface RecipeListProps {
    recipes: RecipeWithDetails[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
    const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithDetails[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const navigate = useNavigate();

    useEffect(() => {
        setFilteredRecipes(recipes);
    }, [recipes]);

    const sortRecipes = () => {
        const sorted = [...filteredRecipes].sort((a, b) => {
            return sortOrder === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        });
        setFilteredRecipes(sorted);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const viewRecipeDetail = (recipe: RecipeWithDetails) => {
        navigate(`/recipe/${recipe.id}`);
    };

    return (
        <div>
            <Button onClick={sortRecipes} className="mb-4">
                Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <Card key={recipe.id}>
                            <CardHeader>
                                <CardTitle>{recipe.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recipe.instructions}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => viewRecipeDetail(recipe)}>View Recipe</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <p>No recipes found</p>
                )}
            </div>
        </div>
    );
};

export default RecipeList;