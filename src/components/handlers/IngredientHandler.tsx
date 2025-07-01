import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Label } from "@/components/ui/label";
import { RecipeIngredient } from '@/types/RecipeTypes';
import useIngredient from '@/hooks/useIngredient';
import IngredientForm from './IngredientForm';
import SortableIngredientItem from './SortableIngredientItem';

interface IngredientHandlerProps {
  ingredients: RecipeIngredient[];
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
}

const IngredientHandler: React.FC<IngredientHandlerProps> = ({ ingredients, setIngredients }) => {
  const { addIngredient, ingredients: existingIngredients, loading, error } = useIngredient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateIngredient = (index: number, field: string, value: string | number) => {
    setIngredients(prev => prev.map((ing, i) => {
      if (i !== index) return ing;
      if (field === 'name') {
        return { 
          ...ing, 
          ingredient: { 
            ...ing.ingredient, 
            name: value as string 
          } 
        };
      } else {
        return { ...ing, [field]: value };
      }
    }));
  };

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setIngredients((items) => {
      const oldIndex = items.findIndex((item, index) => `ingredient-${index}` === active.id);
      const newIndex = items.findIndex((item, index) => `ingredient-${index}` === over.id);

      const reorderedItems = arrayMove(items, oldIndex, newIndex);
      
      // Update order_position for all items
      return reorderedItems.map((item, index) => ({
        ...item,
        order_position: index
      }));
    });
  };

  // Ensure ingredients have order_position set
  const sortedIngredients = ingredients.map((ingredient, index) => ({
    ...ingredient,
    order_position: ingredient.order_position ?? index
  }));

  return (
    <div>
      <Label htmlFor="ingredients">Ingrédients</Label>
      {sortedIngredients && sortedIngredients.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedIngredients.map((_, index) => `ingredient-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            {sortedIngredients.map((ing, index) => (
              <SortableIngredientItem
                key={`ingredient-${index}`}
                id={`ingredient-${index}`}
                ingredient={ing}
                index={index}
                onUpdate={updateIngredient}
                onRemove={removeIngredient}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <p>Aucun ingrédient ajouté pour le moment.</p>
      )}
      <IngredientForm
        addIngredient={addIngredient}
        setIngredients={setIngredients}
        existingIngredients={existingIngredients}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default IngredientHandler;