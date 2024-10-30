import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import IngredientHandler from 'components/IngredientHandler';
import TagHandler from 'components/TagHandler';
import SubRecipeHandler from 'components/SubRecipeHandler';
import { Recipe, RecipeIngredient, SubRecipe, Tag } from '@/types/types';
import { useRecipeDetails } from '@/hooks/useRecipeDetails';
import { useRecipeHandler } from '@/hooks/useRecipeHandler';
import { Clock, Flame } from 'lucide-react';

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
            setIngredients(initialRecipe.recipe_ingredients || []);
            setSelectedTags(initialRecipe.tags || []);
            setSubRecipes(initialRecipe.sub_recipes || []);
            setPrepTime(initialRecipe.prep_time || 0);
            setCookTime(initialRecipe.cook_time || 0);
        }
    }, [initialRecipe]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRecipe(prev => ({
            ...prev,
            [name]: name === 'servings' ? parseInt(value, 10) : value
        }));
        if (name === 'prepTime') setPrepTime(parseInt(value, 10));
        if (name === 'cookTime') setCookTime(parseInt(value, 10));
    };

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

    if (loadingRecipe) return <div>Chargement des détails de la recette...</div>;
    if (loadError) return <div>Erreur lors du chargement de la recette : {loadError}</div>;
    if (!recipe) return <div>Recette non trouvée</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Titre de la recette</Label>
                <Input
                    id="title"
                    name="title"
                    value={recipe.title}
                    onChange={handleInputChange}
                    placeholder="Entrer le titre de la recette"
                    required
                />
            </div>

            <div>
                <Label htmlFor="servings">Portions</Label>
                <Input
                    id="servings"
                    name="servings"
                    type="number"
                    value={recipe.servings}
                    onChange={handleInputChange}
                    min="1"
                    required
                />
            </div>

            <IngredientHandler ingredients={ingredients} setIngredients={setIngredients} />

            <SubRecipeHandler 
                subRecipes={subRecipes}
                setSubRecipes={setSubRecipes}
                recipeId={recipeId}
            />

            <TagHandler 
                selectedTags={selectedTags} 
                setSelectedTags={setSelectedTags}
                newTags={newTags}
                setNewTags={setNewTags}
            />

            <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                    id="instructions"
                    name="instructions"
                    value={recipe.instructions}
                    onChange={handleInputChange}
                    placeholder="Enter cooking instructions"
                    required
                />
            </div>

            <div>
                <Label htmlFor="prepTime">Temps de préparation (minutes)</Label>
                <div className="flex items-center">
                    <Clock className="mr-2" aria-hidden="true" />
                    <Input
                        id="prepTime"
                        name="prepTime"
                        type="number"
                        value={prepTime}
                        onChange={handleInputChange}
                        min="0"
                        required
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="cookTime">Temps de cuisson (minutes)</Label>
                <div className="flex items-center">
                    <Flame className="mr-2" aria-hidden="true" />
                    <Input
                        id="cookTime"
                        name="cookTime"
                        type="number"
                        value={cookTime}
                        onChange={handleInputChange}
                        min="0"
                        required
                    />
                </div>
            </div>

            {updateError && <div className="text-red-500">{updateError}</div>}

            <Button type="submit" disabled={updating}>
                {updating ? 'Mise à jour...' : 'Mettre à jour la recette'}
            </Button>
        </form>
    );
};

export default EditRecipe;