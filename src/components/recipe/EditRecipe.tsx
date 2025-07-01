import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeDetails } from '@/hooks/useRecipeDetails';
import { useRecipeHandler } from '@/hooks/useRecipeHandler';
import { Recipe, RecipeIngredient, SubRecipe, Tag } from '@/types/RecipeTypes';
import RecipeForm from './RecipeForm';
import { Loading, ErrorMessage } from 'components/layout';

const EditRecipe: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const recipeId = id ? parseInt(id, 10) : 0;
    const navigate = useNavigate();
    const { recipe: initialRecipe, loading: loadingRecipe, error: loadError } = useRecipeDetails(recipeId);
    const { handleRecipe, loading: updating, error: updateError } = useRecipeHandler(recipeId);
    const [recipe, setRecipe] = useState<Partial<Recipe>>({
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
    const [prepTime, setPrepTime] = useState<number>(0);
    const [cookTime, setCookTime] = useState<number>(0);

    useEffect(() => {
        if (initialRecipe) {
            setRecipe(initialRecipe);
            setIngredients(initialRecipe.recipe_ingredients ?? []);
            setSelectedTags(initialRecipe.tags ?? []);
            setSubRecipes(initialRecipe.sub_recipes ?? []);
            setPrepTime(initialRecipe.prep_time ?? 0);
            setCookTime(initialRecipe.cook_time ?? 0);
        }
    }, [initialRecipe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recipe.title && (ingredients.length || subRecipes.length) && recipe.instructions) {
            const transformedSubRecipes = subRecipes.map(subRecipe => ({
                ...subRecipe,
                ingredients: subRecipe.ingredients.map(ingredient => ({
                    ...ingredient,
                    id: (ingredient as any).id || ''
                }))
            }));
            const success = await handleRecipe({
                ...recipe,
                prep_time: prepTime,
                cook_time: cookTime,
            }, ingredients, transformedSubRecipes, selectedTags, newTags);
            if (success) {
                navigate(`/recipe/${recipeId}`);
            }
        } else {
            alert('Veuillez remplir tous les champs obligatoires : titre, au moins un ingrédient ou une sous-recette, et instructions.');
        }
    };

    if (loadingRecipe) return <Loading />;
    if (loadError) return <ErrorMessage message={`Erreur lors du chargement de la recette : ${loadError}`} />;
    if (!recipe) return <div>Recette non trouvée</div>;

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
            prepTime={prepTime}
            setPrepTime={setPrepTime}
            cookTime={cookTime}
            setCookTime={setCookTime}
            onSubmit={handleSubmit}
            loading={updating}
            error={updateError || undefined}
        />
    );
};

export default EditRecipe;