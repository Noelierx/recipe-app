import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RecipeList from './components/recipe/RecipeList';
import { RecipeDetails, AddRecipe, EditRecipe } from './components/recipe';
import { Header, Footer } from './components/layout';
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
        <Route path={ROUTES.RECIPE_DETAILS({ id: ':id' })} element={<RecipeDetails />} />
        <Route path={ROUTES.ADD_RECIPE} element={<AddRecipe />} />
        <Route path={ROUTES.EDIT_RECIPE({ id: ':id' })} element={<EditRecipe />} />
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