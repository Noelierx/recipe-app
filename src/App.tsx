import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetails from './components/RecipeDetails';
import AddRecipe from './components/AddRecipe';
import Header from './components/Header';
import Footer from './components/Footer';
import { useRecipes } from '@/hooks/useRecipes';

const App: React.FC = () => {
  const { recipes, loading, error } = useRecipes();

  return (
    <Router>
      <Header />
      <main className="container mx-auto p-4">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <Routes>
            <Route path="/" element={<RecipeList recipes={recipes || []} />} />
            <Route path="/recipe/:id" element={<RecipeDetails />} />
            <Route path="/add-recipe" element={<AddRecipe />} />
          </Routes>
        )}
      </main>
      <Footer />
    </Router>
  );
};

export default App;