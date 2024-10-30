import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import IngredientHandler from 'components/IngredientHandler';
import TagHandler from 'components/TagHandler';
import SubRecipeHandler from 'components/SubRecipeHandler';
import { useRecipeHandler } from '@/hooks/useRecipeHandler';
import { Recipe, RecipeIngredient, Tag, SubRecipe } from '@/types/types';
import { Clock, Flame } from 'lucide-react';

function AddRecipe() {
    const navigate = useNavigate();
    const { handleRecipe, loading, error } = useRecipeHandler();
    const [recipe, setRecipe] = useState<Partial<Recipe & { prep_time?: number; cook_time?: number }>>({
        title: '',
        instructions: '',
        servings: 1,
        prep_time: undefined,
        cook_time: undefined,
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numberFields = ['servings', 'prep_time', 'cook_time'];
        
        setRecipe(prev => ({
            ...prev,
            [name]: numberFields.includes(name) ? Math.max(0, parseInt(value, 10) || 0) : value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Titre de la recette</Label>
                <Input
                    id="title"
                    name="title"
                    value={recipe.title}
                    onChange={handleInputChange}
                    placeholder="Ajouter le titre de la recette"
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

            <IngredientHandler 
                ingredients={ingredients} 
                setIngredients={setIngredients} 
            />

            <SubRecipeHandler 
                subRecipes={subRecipes}
                setSubRecipes={setSubRecipes}
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
                    placeholder="Ajouter les instructions pour réaliser la recette"
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
                        value={recipe.prep_time}
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
                        value={recipe.cook_time}
                        onChange={handleInputChange}
                        min="0"
                        required
                    />
                </div>
            </div>

            <Button type="submit" disabled={loading}>Ajouter la recette</Button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
}

export default AddRecipe;