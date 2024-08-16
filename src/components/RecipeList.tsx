import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Recipe } from '@/types/types';

interface RecipeListProps {
  recipes: Recipe[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const navigate = useNavigate();

    const uniqueTags = useMemo(() => {
        const allTags = recipes.flatMap(recipe => recipe.tags);
        return Array.from(new Set(allTags));
    }, [recipes]);

    useEffect(() => {
        setFilteredRecipes(recipes);
        setTags(uniqueTags);
    }, [recipes, uniqueTags]);

    const filterRecipes = useCallback(() => {
        if (selectedTags.length === 0) {
            setFilteredRecipes(recipes);
        } else {
            const filtered = recipes.filter(recipe =>
                selectedTags.every(tag => recipe.tags.includes(tag))
            );
            setFilteredRecipes(filtered);
        }
    }, [recipes, selectedTags]);

    useEffect(() => {
        filterRecipes();
    }, [filterRecipes]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prevTags =>
            prevTags.includes(tag)
                ? prevTags.filter(t => t !== tag)
                : [...prevTags, tag]
        );
    };

    const sortRecipes = () => {
        const sorted = [...filteredRecipes].sort((a, b) => {
            return sortOrder === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        });
        setFilteredRecipes(sorted);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const viewRecipeDetail = (recipe: Recipe) => {
        navigate(`/recipe/${recipe.id}`);
    };

    return (
        <div>
            <Button onClick={sortRecipes} className="mb-4">
                Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
            <div className="mb-4">
                {tags.length > 0 ? (
                    tags.map(tag => (
                        <Button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="mr-2 mb-2"
                        >
                            {tag}
                        </Button>
                    ))
                ) : (
                    <p>No tags available</p>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.length > 0 ? (
                    filteredRecipes.map(recipe => (
                        <Card key={recipe.id}>
                            <CardHeader>
                                <CardTitle>{recipe.title}</CardTitle>
                                <CardDescription>
                                    Tags: {recipe.tags.join(', ')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recipe.instructions}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => viewRecipeDetail(recipe)}>View Recipe</Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <p>No recipes found</p>
                )}
            </div>
        </div>
    );
};

export default RecipeList;