import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeHandler } from '@/hooks/useRecipeHandler';
import { Recipe, RecipeIngredient, Tag, SubRecipe } from '@/types/types';
import RecipeForm from 'components/RecipeForm';

interface RecipeFormState extends Partial<Recipe> {
  prep_time?: number;
  cook_time?: number;
}

function AddRecipe() {
    const navigate = useNavigate();
    const { handleRecipe, loading, error } = useRecipeHandler();
    const [recipe, setRecipe] = useState<RecipeFormState>({
        title: '',
        instructions: '',
        servings: 1,
        prep_time: 0,
        cook_time: 0,
    });
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [newTags, setNewTags] = useState<string[]>([]);
    const [subRecipes, setSubRecipes] = useState<SubRecipe[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recipe.title && (ingredients.length > 0 || subRecipes.length > 0) && recipe.instructions) {
            const subRecipesAny = subRecipes as any[];
            const result = await handleRecipe(
                recipe,
                ingredients,
                subRecipesAny,
                selectedTags,
                newTags
            );
            if (typeof result === 'number') {
                navigate(`/recipe/${result}`);
            } else {
                alert('Failed to add recipe. Please try again.');
            }
        } else {
            alert('Please fill in all required fields (title, ingredients or subrecipes, and instructions).');
        }
    };

    const handleTimeChange = (key: 'prep_time' | 'cook_time', value: number | ((prevState: number) => number)) => {
        let newValue: number;

        if (typeof value === 'function') {
            newValue = (value as (prevState: number) => number)(recipe[key] ?? 0);
        } else {
            const validValue = value >= 0 ? value : 0;
            newValue = validValue;
        }

        setRecipe(prev => ({
            ...prev,
            [key]: newValue
        }));
    };

    return (
        <RecipeForm
            recipe={recipe}
            setRecipe={setRecipe}
            ingredients={ingredients}
            setIngredients={setIngredients}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            newTags={newTags}
            setNewTags={setNewTags}
            subRecipes={subRecipes}
            setSubRecipes={setSubRecipes}
            prepTime={recipe.prep_time ?? 0}
            setPrepTime={(value) => handleTimeChange('prep_time', value)}
            cookTime={recipe.cook_time ?? 0}
            setCookTime={(value) => handleTimeChange('cook_time', value)}
            onSubmit={handleSubmit}
            loading={loading}
            error={error ?? undefined}
        />
    );
}

export default AddRecipe;