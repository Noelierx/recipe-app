import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { RecipeWithDetails, Tag } from '@/types/types';
import { useGetTags } from '@/hooks/useGetTags';

interface RecipeListProps {
    recipes: RecipeWithDetails[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
    const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithDetails[]>(recipes);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const navigate = useNavigate();
    const { getTags, loading, error } = useGetTags();
    const [allTags, setAllTags] = useState<Tag[]>([]);

    useEffect(() => {
        const fetchTags = async () => {
            const tags = await getTags();
            setAllTags(tags);
        };
        fetchTags();
    }, [getTags]);

    useEffect(() => {
        const filtered = recipes.filter(recipe => {
            if (selectedTags.length === 0) return true;
            return selectedTags.every(selectedTag => 
                recipe.tags.some(recipeTag => 
                    recipeTag.id === selectedTag.id || 
                    (recipeTag.id === undefined && recipeTag.name === selectedTag.name)
                )
            );
        });
        setFilteredRecipes(filtered);
    }, [recipes, selectedTags]);

    const sortRecipes = () => {
        const sorted = [...filteredRecipes].sort((a, b) => {
            return sortOrder === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        });
        setFilteredRecipes(sorted);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const viewRecipeDetail = (recipe: RecipeWithDetails) => {
        navigate(`/recipe/${recipe.id}`);
    };

    const handleTagSelect = (tag: Tag) => {
        setSelectedTags(prev => {
            const isSelected = prev.some(t => t.id === tag.id || (t.id === undefined && t.name === tag.name));
            if (isSelected) {
                const newTags = prev.filter(t => t.id !== tag.id && (t.id !== undefined || t.name !== tag.name));
                return newTags;
            } else {
                const newTags = [...prev, tag];
                return newTags;
            }
        });
    };

    return (
        <div>
            <div className="mb-4">
                {loading ? (
                    <div>Loading tags...</div>
                ) : error ? (
                    <div>Error loading tags: {error}</div>
                ) : allTags.length === 0 ? (
                    <div>No tags available</div>
                ) : (
                    allTags.map((tag, index) => (
                        <Button 
                            key={tag.id ?? `tag-${index}-${tag.name}`}
                            onClick={() => handleTagSelect(tag)}
                            variant={selectedTags.some(t => t.id === tag.id || (t.id === undefined && t.name === tag.name)) ? "secondary" : "outline"}
                            className="mr-2 mb-2"
                        >
                            {tag.name}
                        </Button>
                    ))
                )}
            </div>
            <Button onClick={sortRecipes} className="mb-4">
                Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map(recipe => (
                    <Card key={recipe.id}>
                        <CardHeader>
                            <CardTitle>{recipe.title}</CardTitle>
                            <div className="flex flex-wrap gap-1 mt-2">
                                {recipe.tags.map((tag, index) => (
                                    <Badge 
                                        key={`${recipe.id}-${tag.id ?? index}-${tag.name}`} 
                                        variant="secondary"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>{recipe.instructions}</CardContent>
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