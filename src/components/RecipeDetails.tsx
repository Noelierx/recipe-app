import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Recipe, Ingredient } from '@/types/types';

interface RecipeDetailsProps {
  recipes: Recipe[];
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipes }) => {
    const { id } = useParams<{ id: string }>();
    const recipeId = useMemo(() => parseInt(id || '0', 10), [id]);
    const recipe = useMemo(() => recipes.find(r => r.id === recipeId), [recipes, recipeId]);
    const [servings, setServings] = useState<number>(recipe?.servings || 0);

    if (!recipe) {
        return <div>Recipe not found</div>;
    }

    const adjustIngredients = (ingredients: Ingredient[], originalServings: number, newServings: number): Ingredient[] => {
        return ingredients.map(ing => ({
            ...ing,
            amount: (ing.amount / originalServings) * newServings
        }));
    };

    const adjustedIngredients = adjustIngredients(recipe.ingredients, recipe.servings, servings);

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
                            {ing.name}: {ing.amount.toFixed(2)} {ing.unit}
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