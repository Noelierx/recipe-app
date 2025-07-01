import React from 'react';
import { Clock, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IngredientHandler, SubRecipeHandler, TagHandler } from 'components/handlers';
import RecipeInstructionsEditor from './RecipeInstructionsEditor';
import TimeInput from 'components/TimeInput';
import { Recipe, RecipeIngredient, SubRecipe, Tag } from '@/types/RecipeTypes';

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
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="title">Titre de la recette</Label>
                    <Input
                        id="title"
                        name="title"
                        value={recipe.title}
                        onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
                        placeholder="Ajouter le titre de la recette"
                        className="h-11"
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
                        className="h-11 w-32"
                        required
                    />
                </div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TimeInput
                    id="prepTime"
                    label="Temps de préparation (minutes)"
                    value={prepTime}
                    onChange={(value) => setPrepTime(value ?? 0)}
                    icon={<Clock className="mr-2 h-4 w-4" aria-hidden="true" />}
                />
                <TimeInput
                    id="cookTime"
                    label="Temps de cuisson (minutes)"
                    value={cookTime}
                    onChange={(value) => setCookTime(value ?? 0)}
                    icon={<Flame className="mr-2 h-4 w-4" aria-hidden="true" />}
                />
            </div>

            <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? 'En cours de traitement...' : 'Soumettre'}
                </Button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
        </form>
    );
};

export default RecipeForm;