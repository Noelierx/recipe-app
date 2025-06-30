import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search } from 'lucide-react';
import { useExistingSubRecipes } from '@/hooks/useExistingSubRecipes';
import { SubRecipe } from '@/types/RecipeTypes';

interface SubRecipeWithRecipe extends SubRecipe {
  recipe_title: string;
  recipe_id: number;
}

interface SubRecipeSelectorProps {
  onSelectSubRecipe: (subRecipe: SubRecipe) => void;
}

const SubRecipeSelector: React.FC<SubRecipeSelectorProps> = ({ onSelectSubRecipe }) => {
  const { subRecipes, loading, error } = useExistingSubRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredSubRecipes = useMemo(() => {
    if (!searchQuery.trim()) return subRecipes;
    
    const query = searchQuery.toLowerCase();
    return subRecipes.filter(sr => 
      sr.title.toLowerCase().includes(query) ||
      sr.recipe_title.toLowerCase().includes(query) ||
      sr.ingredients.some(ing => 
        ing.ingredient.name.toLowerCase().includes(query)
      )
    );
  }, [subRecipes, searchQuery]);

  const handleSelectSubRecipe = (subRecipe: SubRecipeWithRecipe) => {
    // Create a clean copy without the extra recipe metadata
    const cleanSubRecipe: SubRecipe = {
      title: subRecipe.title,
      instructions: subRecipe.instructions,
      ingredients: subRecipe.ingredients
    };
    
    onSelectSubRecipe(cleanSubRecipe);
    setIsDialogOpen(false);
    setSearchQuery(''); // Reset search
  };

  const formatAmount = (amount: number): string => {
    return amount % 1 === 0 ? amount.toString() : amount.toFixed(2).replace(/\.?0+$/, '');
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une sous-recette existante
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sélectionner une sous-recette existante</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search-subrecipes">Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-subrecipes"
                type="text"
                placeholder="Rechercher par nom de sous-recette, recette ou ingrédient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading && <p>Chargement des sous-recettes...</p>}
          {error && <p className="text-red-500">Erreur: {error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredSubRecipes.map((subRecipe) => (
              <Card key={`${subRecipe.recipe_id}-${subRecipe.id}`} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{subRecipe.title}</CardTitle>
                  <p className="text-sm text-gray-600">De: {subRecipe.recipe_title}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm">Ingrédients:</h4>
                      <ul className="text-xs space-y-1">
                        {subRecipe.ingredients.slice(0, 3).map((ing, index) => (
                          <li key={index}>
                            {ing.ingredient.name}: {formatAmount(ing.amount)} {ing.unit}
                          </li>
                        ))}
                        {subRecipe.ingredients.length > 3 && (
                          <li className="text-gray-500">+ {subRecipe.ingredients.length - 3} autre(s)...</li>
                        )}
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={() => handleSelectSubRecipe(subRecipe)}
                      className="w-full mt-2"
                      size="sm"
                    >
                      Ajouter cette sous-recette
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!loading && filteredSubRecipes.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              {searchQuery.trim() 
                ? "Aucune sous-recette trouvée pour cette recherche." 
                : "Aucune sous-recette disponible."}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubRecipeSelector;