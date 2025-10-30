import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { GeneratedRecipeModal } from './components/GeneratedRecipeModal';
import { generateRecipe } from './services/openaiService';
import type { Recipe, SearchFilters } from './types';
import { PREFERENCE_OPTIONS, DIFFICULTY_OPTIONS, DIET_OPTIONS } from './constants';
import { useTranslation } from './i18n';

const App: React.FC = () => {
  const { t, language } = useTranslation();
  const [ingredients, setIngredients] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (type: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? undefined : value,
    }));
  };

  const handleGenerateClick = useCallback(async () => {
    if (!ingredients.trim()) {
      setError(t('error.noIngredients'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    try {
      const recipe = await generateRecipe(ingredients, filters, language);
      setGeneratedRecipe(recipe);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('error.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [ingredients, filters, t, language]);

  const closeModal = () => {
    setGeneratedRecipe(null);
    setError(null);
  }

  const FilterGroup: React.FC<{ title: string; options: readonly string[]; type: keyof SearchFilters }> = ({ title, options, type }) => (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <span className="text-white font-medium text-sm">{title}:</span>
      {options.map(option => (
        <button
          key={option}
          onClick={() => handleFilterChange(type, option)}
          className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
            filters[type] === option
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'
          }`}
        >
          {/* FIX: Cast dynamic string to the type of the `t` function's first parameter (`TranslationKey`) to resolve TypeScript error. */}
          {t(`filters.${type}.${option}` as Parameters<typeof t>[0])}
        </button>
      ))}
    </div>
  );
  
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Header />

      <main>
        {/* Hero Section */}
        <div className="relative bg-cover bg-center h-[60vh] md:h-[70vh] flex items-center justify-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 container mx-auto px-4 text-center text-white flex flex-col items-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{t('hero.title')}</h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl drop-shadow-md">{t('hero.subtitle')}</p>
            
            <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-xl shadow-lg">
              <div className="relative">
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder={t('hero.placeholder')}
                  className="w-full p-4 pr-12 text-lg text-slate-900 rounded-lg border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"></path></svg>
              </div>
              <div className="mt-4 flex flex-col md:flex-row gap-4 justify-center">
                  <FilterGroup title={t('filters.preference.title')} options={PREFERENCE_OPTIONS} type="preference" />
                  <FilterGroup title={t('filters.difficulty.title')} options={DIFFICULTY_OPTIONS} type="difficulty" />
                  <FilterGroup title={t('filters.diet.title')} options={DIET_OPTIONS} type="diet" />
              </div>
              <button
                onClick={handleGenerateClick}
                disabled={isLoading}
                className="mt-6 w-full md:w-auto bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 px-12 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M15.5 2.5a2.5 2.5 0 0 0-3.5 0L8.5 6H5a2 2 0 0 0-2 2v3.5a2.5 2.5 0 0 0 0 3.5L6.5 19a2.5 2.5 0 0 0 3.5 0L13.5 15H17a2 2 0 0 0 2-2v-3.5a2.5 2.5 0 0 0 0-3.5L15.5 2.5z"></path></svg>
                )}
                <span>{isLoading ? t('hero.button.loading') : t('hero.button.default')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Today's Picks Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">{t('picks.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <RecipeCard image="https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800" name={t('picks.recipes.chicken')} tags={[t('tags.quick'), t('tags.healthy')]} />
              <RecipeCard image="https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800" name={t('picks.recipes.pasta')} tags={[t('tags.vegetarian'), t('tags.classic')]} />
              <RecipeCard image="https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=800" name={t('picks.recipes.salmon')} tags={[t('tags.lowCal'), t('tags.seafood')]} />
              <RecipeCard image="https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=800" name={t('picks.recipes.soup')} tags={[t('tags.comfort'), t('tags.western')]} />
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">{t('community.title')}</h2>
              <p className="text-lg mb-8">{t('community.subtitle')}</p>
              <button className="bg-white text-orange-500 font-bold py-3 px-8 rounded-full text-lg hover:bg-slate-100 transition-colors duration-300">
                {t('community.button')}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-lg text-white mb-2">AI Chef</p>
          <p className="text-sm">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </footer>

      {(generatedRecipe || error) && (
        <GeneratedRecipeModal
          recipe={generatedRecipe}
          error={error}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default App;