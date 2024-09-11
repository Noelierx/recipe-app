import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { RecipeWithDetails } from '@/types/types'; // Assurez-vous que vous avez importé le bon type
import { useRecipeDetails } from '@/hooks/useRecipeDetails';

const RecipeDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const recipeId = id ? parseInt(id, 10) : 0;
    const { recipe, loading, error } = useRecipeDetails(recipeId);
    const [servings, setServings] = useState<number>(recipe?.servings || 0);

    useEffect(() => {
        if (recipe) {
            setServings(recipe.servings);
        }
    }, [recipe]);

    if (loading) return <div>Loading recipe details...</div>;
    if (error) return <div>Error loading recipe: {error}</div>;
    if (!recipe) return <div>Recipe not found</div>;

    const adjustIngredients = (ingredients: RecipeWithDetails['recipe_ingredients'], originalServings: number, newServings: number) => {
        return ingredients.map(ing => ({
            ...ing,
            amount: (ing.amount / originalServings) * newServings
        }));
    };

    const adjustedIngredients = adjustIngredients(recipe.recipe_ingredients, recipe.servings, servings);

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-semibold mb-4">{recipe.title}</h1>
            <div className="mb-4">
                <label htmlFor="servings">Portions:</label>
                <Input
                    type="number"
                    id="servings"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    min="1"
                    className="w-20"
                />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ingredients:</h3>
            <ul className="list-disc pl-5 mb-4">
                {adjustedIngredients.length > 0 ? (
                    adjustedIngredients.map((ing, index) => (
                        <li key={index}>
                            {ing.ingredient.name}: {ing.amount.toFixed(2)} {ing.unit}
                        </li>
                    ))
                ) : (
                    <li>No ingredients available</li>
                )}
            </ul>
            <h3 className="text-xl font-semibold mb-2">Instructions:</h3>
            <p>{recipe.instructions}</p>
        </div>
    );
};

export default RecipeDetails;