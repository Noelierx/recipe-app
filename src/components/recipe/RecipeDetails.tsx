import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Flame } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/ui/copyButton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RecipeIngredient } from '@/types/RecipeTypes';
import { useRecipeDetails } from '@/hooks/useRecipeDetails';
import { useDeleteRecipe } from '@/hooks/useDeleteRecipe';
import { formatAmount } from '@/utils/formatters';
import { Loading, ErrorMessage } from 'components/layout';
import { convertUnit } from '@/utils/unitConverter';
import { sanitizeInstructions } from '@/utils/sanitizeInstructions';

const RecipeDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const recipeId = id ? parseInt(id, 10) : 0;
    const { recipe, loading, error } = useRecipeDetails(recipeId);
    const [servings, setServings] = useState<number>(recipe?.servings || 0);
    const { deleteRecipe, isDeleting, error: deleteError } = useDeleteRecipe();

    useEffect(() => {
        if (recipe) {
            setServings(recipe.servings);
        }
    }, [recipe]);

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={`Erreur lors du chargement de la recette : ${error}`} />;
    if (!recipe) return <div>Recette non trouvée</div>;

    const adjustIngredients = (ingredients: RecipeIngredient[] | undefined, originalServings: number, newServings: number) => {
        return ingredients?.map(ing => {
            const adjustedAmount = (ing.amount / originalServings) * newServings;
            const { amount, unit } = convertUnit(adjustedAmount, ing.unit);
            return { ...ing, amount, unit };
        }) || [];
    };

    const adjustedMainIngredients = adjustIngredients(recipe.recipe_ingredients, recipe.servings, servings);

    const adjustedSubRecipes = recipe.sub_recipes?.map(subRecipe => ({
        ...subRecipe,
        ingredients: adjustIngredients(subRecipe.ingredients, recipe.servings, servings)
    })) || [];

    const hasSubRecipes = recipe.sub_recipes?.length > 0;

    const handleDeleteRecipe = async () => {
        const success = await deleteRecipe(recipeId);
        if (success) {
            navigate('/');
            window.location.reload();
        }
    };

    const getTextToCopy = () => {
        const mainIngredientsText = adjustedMainIngredients.map(ing => {
            return `${ing.ingredient.name}: ${formatAmount(ing.amount)} ${ing.unit}`;
        }).join('\n');

        const subRecipesText = adjustedSubRecipes.map(subRecipe => {
            const ingredientsText = subRecipe.ingredients.map(ing => {
                return `${ing.ingredient.name}: ${formatAmount(ing.amount)} ${ing.unit}`;
            }).join('\n');
            const instructionsText = sanitizeInstructions(subRecipe.instructions);
            return `${subRecipe.title}:\n${ingredientsText}\n\nInstructions:\n${instructionsText}`;
        }).join('\n\n');

        const mainInstructionsText = sanitizeInstructions(recipe.instructions);

        let textToCopy = `Ingrédients principaux:\n${mainIngredientsText}\n\n`;
        if (hasSubRecipes) {
            textToCopy += `Sous-recettes:\n${subRecipesText}\n\n`;
        }
        textToCopy += `Instructions:\n${mainInstructionsText}`;

        return textToCopy;
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="w-full mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-semibold mb-4">{recipe.title}</h1>
                    <div className="flex space-x-4">
                        <CopyButton textToCopy={getTextToCopy()} buttonText="Copier les détails de la recette" copyType="text" />
                        <CopyButton buttonText="Copier l'URL de la recette" copyType="url" />
                    </div>
                </div>
                <div className="flex items-center mb-4">
                    <label htmlFor="servings" className="mr-2">Portions:</label>
                    <Input
                        type="number"
                        id="servings"
                        value={servings}
                        onChange={(e) => setServings(Number(e.target.value))}
                        min="1"
                        className="w-20 inline-block"
                    />
                </div>
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
            </div>
            
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 md:pr-8 mb-8 md:mb-0">
                    <h2 className="text-2xl font-semibold mb-4">Ingrédients:</h2>
                    <ul className="list-disc pl-5 mb-6">
                        {adjustedMainIngredients.map((ing, index) => (
                            <li key={index}>
                                {ing.ingredient.name}: {formatAmount(ing.amount)} {ing.unit}
                            </li>
                        ))}
                    </ul>

                    {hasSubRecipes && (
                        <>
                            {adjustedSubRecipes.map((subRecipe, subIndex) => (
                                <div key={subIndex} className="mb-4">
                                    <h2 className="text-xl font-semibold mb-2">{subRecipe.title}</h2>
                                    <ul className="list-disc pl-5">
                                        {subRecipe.ingredients.map((ing, ingIndex) => (
                                            <li key={ingIndex}>
                                                {ing.ingredient.name}: {formatAmount(ing.amount)} {ing.unit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <div className="w-full md:w-1/2">
                    <h2 className="text-2xl font-semibold mb-4">Instructions:</h2>
                    {hasSubRecipes && adjustedSubRecipes.map((subRecipe, index) => (
                        <div key={index} className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">{subRecipe.title}</h3>
                            <div dangerouslySetInnerHTML={{ 
                                __html: sanitizeInstructions(subRecipe.instructions)
                            }} />
                        </div>
                    ))}
                    {hasSubRecipes && (<h3 className="text-xl font-semibold mb-2">La suite</h3>)}
                    <div className="mb-6" dangerouslySetInnerHTML={{ 
                        __html: sanitizeInstructions(recipe.instructions)
                    }} />
                    <div className="flex space-x-4">
                        <Button onClick={() => navigate(`/recipe/${recipe.id}/edit`)}>Modifier la recette</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeleting}>Supprimer la recette</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Cette action ne peut pas être annulée. Cela supprimera définitivement la recette
                                        et retirera les données de nos serveurs.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRecipe()}>
                                        {isDeleting ? 'Suppression...' : 'Supprimer'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
            {deleteError && <div className="text-red-500 mt-4">Erreur en supprimant la recette: {deleteError}</div>}
        </div>
    );
};

export default RecipeDetails;