/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SubRecipeSelector from '../components/SubRecipeSelector';

// Mock the Supabase client
jest.mock('../@/utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }
}));

// Mock the custom hook
jest.mock('../@/hooks/useExistingSubRecipes', () => ({
  useExistingSubRecipes: () => ({
    subRecipes: [],
    loading: false,
    error: null
  })
}));

describe('SubRecipeSelector', () => {
  it('should render the add existing subrecipe button', () => {
    const mockOnSelect = jest.fn();
    
    render(<SubRecipeSelector onSelectSubRecipe={mockOnSelect} />);
    
    expect(screen.getByText('Ajouter une sous-recette existante')).toBeInTheDocument();
  });
});