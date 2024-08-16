// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetails from './components/RecipeDetails';
import { Recipe } from '@/types/types';
import recipeData from '@/data/recipes.json';

const App: React.FC = () => {
  // Assuming recipeData.recipes is an array of Recipe
  const recipes: Recipe[] = recipeData.recipes;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecipeList recipes={recipes} />} />
        <Route path="/recipe/:id" element={<RecipeDetails recipes={recipes} />} />
      </Routes>
    </Router>
  );
};

export default App;