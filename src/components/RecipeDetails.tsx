import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Recipe, Ingredient } from '@/types/types';

interface RecipeDetailProps {
  recipes: Recipe[];
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipes }) => {
    const [servings, setServings] = useState<number>(0);
    const { id } = useParams<{ id: string }>();
    const recipe = recipes.find(r => r.id === parseInt(id || '0', 10));

    useEffect(() => {
        if (recipe) {
            setServings(recipe.servings);
        }
    }, [recipe]);

    const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newServings = Number(e.target.value);
        if (!isNaN(newServings) && newServings >= 1) {
            setServings(newServings);
        }
    };

    if (!recipe) {
        return <div>Recipe not found</div>;
    }

    const adjustIngredients = (ingredients: Ingredient[], originalServings: number, newServings: number): Ingredient[] => {
        return ingredients.map(ing => ({
            ...ing,
            amount: (ing.amount / originalServings) * newServings
        }));
    };

    const adjustedIngredients = useMemo(() => adjustIngredients(recipe.ingredients, recipe.servings, servings), [recipe.ingredients, recipe.servings, servings]);

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{recipe.title}</h2>
            <div className="mb-4">
                <label htmlFor="servings">Portions:</label>
                <Input
                    type="number"
                    id="servings"
                    value={servings}
                    onChange={handleServingsChange}
                    min="1"
                    className="w-20"
                />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ingredients:</h3>
            <ul className="list-disc pl-5 mb-4">
                {adjustedIngredients.map((ing, index) => (
                    <li key={index}>
                        {ing.name}: {ing.amount.toFixed(2)} {ing.unit}
                    </li>
                ))}
            </ul>
            <h3 className="text-xl font-semibold mb-2">Instructions:</h3>
            <p>{recipe.instructions}</p>
        </div>
    );
};

export default RecipeDetail;