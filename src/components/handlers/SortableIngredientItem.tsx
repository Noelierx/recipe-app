import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { RecipeIngredient } from '@/types/RecipeTypes';
import { allowedUnits, Unit } from '@/constants';
import { convertUnit } from '@/utils/unitConverter';

interface SortableIngredientItemProps {
  ingredient: RecipeIngredient;
  index: number;
  onUpdate: (index: number, field: string, value: string | number) => void;
  onRemove: (index: number) => void;
  id: string;
}

const SortableIngredientItem: React.FC<SortableIngredientItemProps> = ({
  ingredient,
  index,
  onUpdate,
  onRemove,
  id
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAmountChange = (value: string) => {
    const { amount, unit } = convertUnit(Number(value), ingredient.unit as Unit);
    onUpdate(index, 'amount', amount);
    if (unit !== ingredient.unit) {
      onUpdate(index, 'unit', unit);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 mb-2 p-2 bg-white border rounded-md transition-all duration-200 ${
        isDragging 
          ? 'shadow-2xl border-blue-300 bg-blue-50 rotate-2 scale-105' 
          : 'shadow-sm hover:shadow-md border-gray-200'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        aria-label={`Drag to reorder ${ingredient.ingredient.name} ingredient`}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
          }
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.stopPropagation();
          }
        }}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      
      <Input
        value={ingredient.amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        type="number"
        className="flex-1"
        aria-label="Ingredient amount"
      />
      
      <Select
        name="unit"
        value={ingredient.unit}
        onValueChange={(value) => onUpdate(index, 'unit', value)}
      >
        <SelectTrigger className="flex-1 border border-gray-300 rounded-md p-2">
          <SelectValue placeholder="Sélectionner une unité" />
        </SelectTrigger>
        <SelectContent>
          {allowedUnits.map(unit => (
            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Input
        value={ingredient.ingredient.name}
        onChange={(e) => onUpdate(index, 'name', e.target.value)}
        className="flex-1"
        aria-label="Ingredient name"
      />
      
      <Button 
        type="button" 
        onClick={() => onRemove(index)} 
        variant="destructive" 
        size="sm" 
        className="flex-1"
        aria-label={`Remove ${ingredient.ingredient.name}`}
      >
        <Trash2 className="mr-2" /> Retirer l'ingrédient
      </Button>
    </div>
  );
};

export default SortableIngredientItem;