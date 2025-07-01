import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IngredientHandler from '../IngredientHandler';
import { RecipeIngredient } from '@/types/RecipeTypes';

// Mock the Supabase client
jest.mock('@/utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }
}));

// Mock the hooks
jest.mock('@/hooks/useIngredient', () => ({
  __esModule: true,
  default: () => ({
    addIngredient: jest.fn(),
    ingredients: [],
    loading: false,
    error: null
  })
}));

const mockIngredients: RecipeIngredient[] = [
  {
    amount: 2,
    unit: 'cup',
    ingredient: { id: 1, name: 'Flour', amount: 2, unit: 'cup' },
    order_position: 0
  },
  {
    amount: 1,
    unit: 'tsp',
    ingredient: { id: 2, name: 'Salt', amount: 1, unit: 'tsp' },
    order_position: 1
  }
];

describe('IngredientHandler', () => {
  const mockSetIngredients = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ingredients with drag-and-drop functionality', () => {
    render(
      <IngredientHandler
        ingredients={mockIngredients}
        setIngredients={mockSetIngredients}
      />
    );

    // Check if ingredients are rendered
    expect(screen.getByDisplayValue('Flour')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Salt')).toBeInTheDocument();
    
    // Check if drag handles are present with ingredient-specific labels
    expect(screen.getByLabelText('Drag to reorder Flour ingredient')).toBeInTheDocument();
    expect(screen.getByLabelText('Drag to reorder Salt ingredient')).toBeInTheDocument();

    // Check if the ingredients label is present
    expect(screen.getByText('Ingrédients')).toBeInTheDocument();
  });

  test('renders empty state when no ingredients', () => {
    render(
      <IngredientHandler
        ingredients={[]}
        setIngredients={mockSetIngredients}
      />
    );

    expect(screen.getByText('Aucun ingrédient ajouté pour le moment.')).toBeInTheDocument();
  });

  test('ingredients have proper order_position assignment', () => {
    render(
      <IngredientHandler
        ingredients={mockIngredients}
        setIngredients={mockSetIngredients}
      />
    );

    // Verify ingredients are rendered in correct order
    const ingredientInputs = screen.getAllByDisplayValue(/Flour|Salt/);
    expect(ingredientInputs[0]).toHaveValue('Flour');
    expect(ingredientInputs[1]).toHaveValue('Salt');
  });
});