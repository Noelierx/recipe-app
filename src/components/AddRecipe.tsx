import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Recipe, Ingredient, RecipeIngredient } from '@/types/types';
import { useAddRecipe } from '@/hooks/useAddRecipe';
import { useGetTags } from '@/hooks/useGetTags';
import { supabase } from '@/utils/supabaseClient';
import { Tag } from '@/types/types';

const AddRecipe: React.FC = () => {
    const navigate = useNavigate();
    const { addRecipe, loading, error } = useAddRecipe();
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [newTag, setNewTag] = useState('');
    const { getTags } = useGetTags();
    const tagsLoaded = useRef(false);

    const [recipe, setRecipe] = useState<Partial<Recipe>>({
        title: '',
        instructions: '',
        servings: 1,
    });

    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
    const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
        name: '',
        amount: 0,
        unit: '',
    });

    useEffect(() => {
        if (!tagsLoaded.current) {
            const fetchTags = async () => {
                const fetchedTags = await getTags();
                setTags(fetchedTags);
                tagsLoaded.current = true;
            };
            fetchTags();
        }
    }, [getTags]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (recipe.title && ingredients.length && recipe.instructions) {
            try {
                const newRecipeId = await addRecipe(recipe as Recipe, ingredients, selectedTags);
                navigate(`/recipe/${newRecipeId}`);
            } catch (error) {
                alert('Failed to add recipe. Please try again.');
            }
        } else {
            alert('Please fill in all required fields (title, ingredients, and instructions).');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRecipe(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleServingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRecipe(prev => ({
            ...prev,
            servings: parseInt(e.target.value, 10)
        }));
    };

    const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewIngredient(prev => ({
            ...prev,
            [name]: value
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

    const handleTagSelect = (tag: Tag) => {
        setSelectedTags(prev => 
            prev.some(t => t.id === tag.id)
                ? prev.filter(t => t.id !== tag.id)
                : [...prev, tag]
        );
    };

    const addNewTag = () => {
        if (newTag && !selectedTags.some(tag => tag.name.toLowerCase() === newTag.toLowerCase())) {
            setSelectedTags(prev => [...prev, { name: newTag } as Tag]);
            setNewTag('');
        }
    };

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
                        value={newIngredient.amount || ''}
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
                            onClick={() => handleTagSelect(tag)}
                            variant={selectedTags.some(t => t.id === tag.id) ? "secondary" : "outline"}
                        >
                            {tag.name}
                        </Button>
                    ))}
                    {selectedTags.filter(tag => !tag.id).map((tag, index) => (
                        <Button
                            key={`new-${index}`}
                            type="button"
                            onClick={() => handleTagSelect(tag)}
                            variant="secondary"
                        >
                            {tag.name} (New)
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
                    <Button type="button" onClick={addNewTag}>Add Tag</Button>
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

            <Button type="submit" disabled={loading}>Submit Recipe</Button>
            {error && <p className="text-red-500">{error}</p>}
        </form>
    );
};

export default AddRecipe;