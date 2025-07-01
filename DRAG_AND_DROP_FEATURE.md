# Drag-and-Drop Ingredient Ordering Feature

## Overview
The Recipe App now includes a comprehensive drag-and-drop feature that allows users to reorder ingredients in both main recipes and subrecipes. The feature provides an intuitive, accessible, and visually appealing way to organize ingredients according to user preferences.

## Key Features

### 🎯 Core Functionality
- **Drag-and-Drop Reordering**: Users can drag ingredients to reorder them within recipes
- **Persistent Ordering**: Changes are automatically saved to the database
- **Subrecipe Support**: Works for both main recipe ingredients and subrecipe ingredients
- **Real-time Updates**: Order changes are immediately reflected in the UI

### 🎨 Visual Design
- **Smooth Animations**: Fluid drag animations with CSS transitions
- **Visual Feedback**: Dragged items show enhanced shadows, scaling, and rotation
- **Clear Drag Handles**: Dedicated grip icons for intuitive drag interaction
- **Hover States**: Clear visual indicators for interactive elements

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support using Space/Enter keys
- **Screen Reader Support**: Proper ARIA labels and announcements
- **Focus Management**: Clear focus indicators and tab navigation
- **Mobile Support**: Touch-friendly drag operations on mobile devices

## Technical Implementation

### Database Schema
Added `order_position` field to ingredient tables:
- `recipe_ingredients.order_position` (INTEGER)
- `sub_recipe_ingredients.order_position` (INTEGER)

### Components
- **IngredientHandler**: Updated with DndContext and sortable functionality
- **SortableIngredientItem**: New component handling individual ingredient drag behavior
- **SubRecipeHandler**: Automatically inherits drag-and-drop through IngredientHandler

### Libraries Used
- **@dnd-kit/core**: Modern, accessible drag-and-drop foundation
- **@dnd-kit/sortable**: Sortable list functionality
- **@dnd-kit/utilities**: Helper utilities for transformations

## Usage

### For Users
1. Navigate to any recipe editing page
2. Look for the grip handle (⋮⋮) next to each ingredient
3. Click and drag the handle to reorder ingredients
4. Release to drop the ingredient in the new position
5. Changes are automatically saved

### For Developers
The drag-and-drop functionality is automatically available in any component using `IngredientHandler`:

```tsx
import { IngredientHandler } from '@/components/handlers';

function RecipeForm() {
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  
  return (
    <IngredientHandler
      ingredients={ingredients}
      setIngredients={setIngredients}
    />
  );
}
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate between drag handles
- **Space/Enter**: Activate drag mode
- **Arrow Keys**: Move items during drag (handled by @dnd-kit)
- **Escape**: Cancel drag operation

### Screen Reader Support
- Each drag handle has descriptive labels
- Drag state changes are announced
- Clear instructions provided via aria-describedby

### Visual Accessibility
- High contrast focus indicators
- Clear visual separation between draggable items
- Consistent spacing and sizing

## Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers with touch support

## Performance Considerations
- Lightweight animations using CSS transforms
- Debounced database updates
- Optimistic UI updates for immediate feedback
- Minimal re-renders during drag operations

## Testing
The feature includes comprehensive unit tests covering:
- Component rendering
- Drag-and-drop functionality
- Accessibility attributes
- Order persistence
- Error handling

Run tests with:
```bash
npm test src/components/handlers/__tests__/
```

## Future Enhancements
- Cross-recipe ingredient moving
- Bulk ingredient operations
- Drag-and-drop for recipe steps
- Ingredient grouping capabilities