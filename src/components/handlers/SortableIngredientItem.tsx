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
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2 p-2 bg-white border rounded-md transition-all duration-200 ${
        isDragging
          ? 'shadow-2xl border-blue-300 bg-blue-50 rotate-2 scale-105'
          : 'shadow-sm hover:shadow-md border-gray-200'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded touch-none min-w-[44px] min-h-[44px] flex items-center justify-center self-start sm:self-auto"
        style={{ touchAction: 'none' }}
        aria-label={`Drag to reorder ${ingredient.ingredient.name} ingredient`}
        draggable={false}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
          }
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.stopPropagation();
          }
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <Input
        value={ingredient.amount}
        onChange={(e) => handleAmountChange(e.target.value)}
        type="number"
        className="w-full sm:w-auto"
        aria-label="Ingredient amount"
        draggable={false}
      />

      <Select
        name="unit"
        value={ingredient.unit}
        onValueChange={(value) => onUpdate(index, 'unit', value)}
      >
        <SelectTrigger className="w-full sm:w-auto border border-gray-300 rounded-md p-2">
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
        className="w-full sm:w-auto"
        aria-label="Ingredient name"
        draggable={false}
      />

      <Button
        type="button"
        onClick={() => onRemove(index)}
        variant="destructive"
        size="sm"
        className="w-full sm:w-auto"
        aria-label={`Remove ${ingredient.ingredient.name}`}
        draggable={false}
      >
        <Trash2 className="mr-2" /> Retirer l'ingrédient
      </Button>
    </div>
  );
};

export default SortableIngredientItem;