import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IngredientHandler from 'components/IngredientHandler';
import RecipeInstructionsEditor from './RecipeInstructionsEditor';
import SubRecipeHandler from 'components/SubRecipeHandler';
import TagHandler from 'components/TagHandler';
import { useRecipeHandler } from '@/hooks/useRecipeHandler';
import { Recipe, RecipeIngredient, Tag, SubRecipe } from '@/types/types';

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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Titre de la recette</Label>
                <Input
                    id="title"
                    name="title"
                    value={recipe.title}
                    onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
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
                    onChange={(e) => setRecipe({ ...recipe, servings: Number(e.target.value) })}
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
                <RecipeInstructionsEditor
                    value={recipe.instructions || ''}
                    onChange={(value) => setRecipe(prev => ({ ...prev, instructions: value }))}
                    placeholder="Ajouter les instructions pour réaliser la recette"
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
                        onChange={(e) => setRecipe({ ...recipe, prep_time: Number(e.target.value) })}
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
                        onChange={(e) => setRecipe({ ...recipe, cook_time: Number(e.target.value) })}
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