import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetails from './components/RecipeDetails';
import AddRecipe from './components/AddRecipe';
import EditRecipe from './components/EditRecipe';
import Header from './components/Header';
import Footer from './components/Footer';
import { useRecipes } from '@/hooks/useRecipes';
import { ROUTES } from '@/types/routes';

const App: React.FC = () => {
  const { recipes, loading, error } = useRecipes();

  let content;

  if (loading) {
    content = <div>Loading...</div>;
  } else if (error) {
    content = <div>Error: {error}</div>;
  } else {
    content = (
      <Routes>
        <Route path={ROUTES.HOME} element={<RecipeList recipes={recipes || []} />} />
        <Route path={ROUTES.RECIPE_DETAILS(':id')} element={<RecipeDetails />} />
        <Route path={ROUTES.ADD_RECIPE} element={<AddRecipe />} />
        <Route path={ROUTES.EDIT_RECIPE(':id')} element={<EditRecipe />} />
      </Routes>
    );
  }

  return (
    <Router>
      <Header />
      <main className="container mx-auto p-4">
        {content}
      </main>
      <Footer />
    </Router>
  );
};

export default App;