import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetails from './components/RecipeDetails';
import { Recipe } from '@/types/types';
import recipeData from '@/data/recipes.json';

const App: React.FC = () => {
  const recipes: Recipe[] = recipeData.recipes;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecipeList recipes={recipes} />} />
        <Route path="/recipe/:id" element={<RecipeDetails recipes={[recipes[0]]} />} />
      </Routes>
    </Router>
  );
};

export default App;