import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { RecipeList, RecipeDetails, AddRecipe, EditRecipe } from './components/recipe';
import MealPlanner from './components/mealPlanner/MealPlanner';
import { Header, Footer, Loading, ErrorMessage } from './components/layout';
import { useRecipes } from '@/hooks/useRecipes';
import { ROUTES } from '@/types/routes';

const App: React.FC = () => {
  const { recipes, loading, error } = useRecipes();

  let content;

  if (loading) {
    content = <Loading />;
  } else if (error) {
    content = <ErrorMessage message={error} />;
  } else {
    content = (
      <Routes>
        <Route path={ROUTES.HOME} element={<RecipeList recipes={recipes || []} />} />
        <Route path={ROUTES.RECIPE_DETAILS({ id: ':id' })} element={<RecipeDetails />} />
        <Route path={ROUTES.ADD_RECIPE} element={<AddRecipe />} />
        <Route path={ROUTES.EDIT_RECIPE({ id: ':id' })} element={<EditRecipe />} />
        <Route path={ROUTES.MEAL_PLANNER} element={<MealPlanner recipes={recipes || []} />} />
      </Routes>
    );
  }

  return (
    <Router>
      <Header />
      <main className="container mx-auto px-4 py-6 min-h-screen">
        {content}
      </main>
      <Footer />
    </Router>
  );
};

export default App;