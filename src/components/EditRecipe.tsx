import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Recipe, Ingredient, RecipeIngredient, Tag } from '@/types/types';
import { useRecipeDetails } from '@/hooks/useRecipeDetails';
import { useGetTags } from '@/hooks/useGetTags';
import { supabase } from '@/utils/supabaseClient';
import { useUpdateRecipe } from '@/hooks/useUpdateRecipe';

const EditRecipe: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const recipeId = id ? parseInt(id, 10) : 0;
    const navigate = useNavigate();
    const { recipe: initialRecipe, loading, error } = useRecipeDetails(recipeId);
    const [recipe, setRecipe] = useState<Partial<Recipe>>({});
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
    const [newIngredient, setNewIngredient] = useState<Partial<Ingredient & { amount: number }>>({ name: '', amount: 0, unit: '' });
    const [tags, setTags] = useState<Tag[]>([]);
    const [existingTags, setExistingTags] = useState<Tag[]>([]);
    const [newTags, setNewTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const { getTags } = useGetTags();
    const { updateRecipe, loading: updating, error: updateError } = useUpdateRecipe(recipeId);

    useEffect(() => {
        if (initialRecipe) {
            setRecipe(initialRecipe);
            setIngredients(initialRecipe.recipe_ingredients || []);
            setExistingTags(initialRecipe.tags || []);
        }
    }, [initialRecipe]);

    useEffect(() => {
        const fetchTags = async () => {
            const fetchedTags = await getTags();
            setTags(fetchedTags);
        };
        fetchTags();
    }, [getTags]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRecipe(prev => ({ ...prev, [name]: value }));
    };

    const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value, 10) }));
    };

    const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewIngredient(prev => ({
            ...prev,
            [name]: name === 'amount' ? (value === '' ? 0 : Number(value)) : value
        }));
    };

    const addIngredient = async () => {
        if (newIngredient.name && newIngredient.amount !== undefined && newIngredient.unit) {
            try {
                const { data, error } = await supabase
                    .from('ingredients')
                    .select('id')
                    .eq('name', newIngredient.name)
                    .single();

                let ingredientId: number;
                if (error || !data) {
                    const { data: newData, error: insertError } = await supabase
                        .from('ingredients')
                        .insert({ name: newIngredient.name })
                        .select('id')
                        .single();

                    if (insertError) throw insertError;
                    ingredientId = newData.id;
                } else {
                    ingredientId = data.id;
                }

                setIngredients(prev => [
                    ...prev,
                    {
                        amount: newIngredient.amount!,
                        unit: newIngredient.unit!,
                        ingredient: {
                            id: ingredientId,
                            name: newIngredient.name!,
                            amount: newIngredient.amount!,
                            unit: newIngredient.unit!,
                        }
                    }
                ]);
                setNewIngredient({ name: '', amount: 0, unit: '' });
            } catch (error) {
                alert('Failed to add ingredient. Please try again.');
            }
        } else {
            alert('Please fill in all ingredient fields.');
        }
    };

    const removeIngredient = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const handleExistingTagSelect = (tag: Tag) => {
        setExistingTags(prev => 
            prev.some(t => t.id === tag.id)
                ? prev.filter(t => t.id !== tag.id)
                : [...prev, tag]
        );
    };

    const handleNewTagAdd = () => {
        if (newTag && !newTags.includes(newTag) && !existingTags.some(t => t.name.toLowerCase() === newTag.toLowerCase())) {
            setNewTags(prev => [...prev, newTag]);
            setNewTag('');
        }
    };

    const removeNewTag = (tagToRemove: string) => {
        setNewTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recipe.title && ingredients.length && recipe.instructions) {
            const success = await updateRecipe(recipe, ingredients, existingTags, newTags);
            if (success) {
                navigate(`/recipe/${recipeId}`);
            }
        } else {
            alert('Please fill in all required fields: title, at least one ingredient, and instructions.');
        }
    };

    if (loading) return <div>Loading recipe details...</div>;
    if (error) return <div>Error loading recipe: {error}</div>;
    if (!recipe) return <div>Recipe not found</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Recipe Title</Label>
                <Input
                    id="title"
                    name="title"
                    value={recipe.title}
                    onChange={handleInputChange}
                    placeholder="Enter recipe title"
                    required
                />
            </div>

            <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                    id="servings"
                    name="servings"
                    type="number"
                    value={recipe.servings}
                    onChange={handleServingsChange}
                    min="1"
                    required
                />
            </div>

            <div>
                <Label>Ingredients</Label>
                {ingredients.map((ing, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <span>{ing.amount} {ing.unit} {ing.ingredient.name}</span>
                        <Button type="button" onClick={() => removeIngredient(index)} variant="destructive" size="sm">Remove</Button>
                    </div>
                ))}
                <div className="flex space-x-2">
                    <Input
                        name="name"
                        value={newIngredient.name}
                        onChange={handleIngredientChange}
                        placeholder="Ingredient name"
                    />
                    <Input
                        name="amount"
                        type="number"
                        value={newIngredient.amount ?? 0}
                        onChange={handleIngredientChange}
                        placeholder="Amount"
                    />
                    <Input
                        name="unit"
                        value={newIngredient.unit}
                        onChange={handleIngredientChange}
                        placeholder="Unit"
                    />
                    <Button type="button" onClick={addIngredient}>Add Ingredient</Button>
                </div>
            </div>

            <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                        <Button
                            key={tag.id}
                            type="button"
                            onClick={() => handleExistingTagSelect(tag)}
                            variant={existingTags.some(t => t.id === tag.id) ? "secondary" : "outline"}
                        >
                            {tag.name}
                        </Button>
                    ))}
                    {newTags.map((tag, index) => (
                        <Button
                            key={`new-${index}`}
                            type="button"
                            onClick={() => removeNewTag(tag)}
                            variant="secondary"
                        >
                            {tag} (New)
                        </Button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="New tag"
                    />
                    <Button type="button" onClick={handleNewTagAdd}>Add Tag</Button>
                </div>
            </div>

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

            {updateError && <div className="text-red-500">{updateError}</div>}

            <Button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Update Recipe'}
            </Button>
        </form>
    );
};

export default EditRecipe;