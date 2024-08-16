import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import recipeData from '@/data/recipes.json';
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

    useEffect(() => {
        setFilteredRecipes(recipes);
        extractTags(recipes);
    }, [recipes]);

    function extractTags(recipes: Recipe[]) {
        const allTags = recipes.flatMap(recipe => recipe.tags);
        const uniqueTags = Array.from(new Set(allTags));
        setTags(uniqueTags);
    }    

    const filterRecipes = () => {
        if (selectedTags.length === 0) {
            setFilteredRecipes(recipes);
        } else {
            const filtered = recipes.filter(recipe =>
                selectedTags.every(tag => recipe.tags.includes(tag))
            );
            setFilteredRecipes(filtered);
        }
    };

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

    useEffect(() => {
        filterRecipes();
    }, [selectedTags]);

    const viewRecipeDetail = (recipe: Recipe) => {
        navigate(`/recipe/${recipe.id}`);
    };

    return (
        <div>
            <Button onClick={sortRecipes} className="mb-4">
                Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
            <div className="mb-4">
                {tags.map(tag => (
                    <Button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="mr-2 mb-2"
                    >
                        {tag}
                    </Button>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map(recipe => (
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
                ))}
            </div>
        </div>
    );
};

export default RecipeList;