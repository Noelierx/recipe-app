import React from 'react';
import { Clock, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IngredientHandler from 'components/IngredientHandler';
import RecipeInstructionsEditor from 'components/RecipeInstructionsEditor';
import SubRecipeHandler from 'components/SubRecipeHandler';
import TagHandler from 'components/TagHandler';
import { Recipe, RecipeIngredient, SubRecipe, Tag } from '@/types/types';

interface RecipeFormProps {
    recipe: Partial<Recipe>;
    setRecipe: React.Dispatch<React.SetStateAction<Partial<Recipe>>>;
    ingredients: RecipeIngredient[];
    setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
    selectedTags: Tag[];
    setSelectedTags: React.Dispatch<React.SetStateAction<Tag[]>>;
    newTags: string[];
    setNewTags: React.Dispatch<React.SetStateAction<string[]>>;
    subRecipes: SubRecipe[];
    setSubRecipes: React.Dispatch<React.SetStateAction<SubRecipe[]>>;
    prepTime: number;
    setPrepTime: React.Dispatch<React.SetStateAction<number>>;
    cookTime: number;
    setCookTime: React.Dispatch<React.SetStateAction<number>>;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
    error?: string;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
    recipe,
    setRecipe,
    ingredients,
    setIngredients,
    selectedTags,
    setSelectedTags,
    newTags,
    setNewTags,
    subRecipes,
    setSubRecipes,
    prepTime,
    setPrepTime,
    cookTime,
    setCookTime,
    onSubmit,
    loading,
    error,
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
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
                        value={prepTime || ''}
                        onChange={(e) => setPrepTime(e.target.value ? Number(e.target.value) : 0)}
                        min=""
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
                        value={cookTime || ''}
                        onChange={(e) => setCookTime(e.target.value ? Number(e.target.value) : 0)}
                        min=""
                    />
                </div>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? 'En cours de traitement...' : 'Soumettre'}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
};

export default RecipeForm;