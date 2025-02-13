import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Clock, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SearchBar from 'components/SearchBar';
import { Loading, ErrorMessage } from 'components/layout';
import { RecipeWithDetails, Tag } from '@/types/RecipeTypes';
import { useGetTags } from '@/hooks/useGetTags';

interface RecipeListProps {
    recipes: RecipeWithDetails[];
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes }) => {
    const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithDetails[]>(recipes);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
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

    const matchesTags = useCallback((recipe: RecipeWithDetails): boolean => {
        if (selectedTags.length === 0) return true;
        return selectedTags.every(selectedTag =>
            recipe.tags.some(recipeTag =>
                (recipeTag.id && selectedTag.id && recipeTag.id === selectedTag.id) ||
                (recipeTag.name === selectedTag.name)
            )
        );
    }, [selectedTags]);

    const matchesSearch = useCallback((recipe: RecipeWithDetails): boolean => {
        const searchLower = searchQuery.toLowerCase();
        const titleLower = recipe.title.toLowerCase();
        if (titleLower.includes(searchLower)) return true;
        return recipe.recipe_ingredients.some(recipeIngredient =>
            recipeIngredient.ingredient.name.toLowerCase().includes(searchLower)
        );
    }, [searchQuery]);

    useEffect(() => {
        const filtered = recipes.filter(recipe => matchesTags(recipe) && matchesSearch(recipe));
        setFilteredRecipes(filtered);
    }, [recipes, selectedTags, searchQuery, matchesTags, matchesSearch]);

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

    const getButtonVariant = (tag: Tag): "default" | "secondary" => {
        const isSelected = selectedTags.some(t =>
            t.id === tag.id || (t.id === undefined && t.name === tag.name)
        );
        return isSelected ? "default" : "secondary";
    };

    const renderTags = () => {
        if (loading) {
            return <Loading />;
        }
        if (error) {
            return <ErrorMessage message={`Erreur lors du chargement des tags : ${error}`} />
        }
        if (allTags.length === 0) {
            return <div className="text-muted">Aucun tag disponible</div>;
        }
        return allTags.map((tag, index) => (
            <Button
                key={`tag-${tag.id ?? tag.name}-${index}`}
                onClick={() => handleTagSelect(tag)}
                variant={getButtonVariant(tag)}
                className="mr-2 mb-2"
            >
                {tag.name}
            </Button>
        ));
    };

    return (
        <div>
            <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <div className="mb-4">
                {renderTags()}
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
                                    <Badge key={`${recipe.id}-${tag.id ?? index}-${tag.name}`}>
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recipe.prep_time ? (
                                <div className="flex items-center mb-4">
                                    <Clock className="mr-2" aria-hidden="true" />
                                    <span>Temps de préparation: {recipe.prep_time} minutes</span>
                                </div>
                            ) : null}
                            {recipe.cook_time ? (
                                <div className="flex items-center mb-4">
                                    <Flame className="mr-2" aria-hidden="true" />
                                    <span>Temps de cuisson: {recipe.cook_time} minutes</span>
                                </div>
                            ) : null}
                            <div className="mb-6" dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(recipe.instructions, {
                                    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'u', 'ol', 'ul', 'li', 'a'],
                                    ALLOWED_ATTR: []
                                })
                            }} />
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button onClick={() => viewRecipeDetail(recipe)}>Voir la recette</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RecipeList;