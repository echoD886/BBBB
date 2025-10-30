import React from 'react';
import type { Recipe } from '../types';
import { useTranslation } from '../i18n';

interface GeneratedRecipeModalProps {
  recipe: Recipe | null;
  error: string | null;
  onClose: () => void;
}

export const GeneratedRecipeModal: React.FC<GeneratedRecipeModalProps> = ({ recipe, error, onClose }) => {
  const { t } = useTranslation();
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-slate-800">{recipe ? recipe.recipeName : t('modal.title')}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
              <h3 className="font-bold text-lg">{t('modal.error.title')}</h3>
              <p>{error}</p>
            </div>
          )}
          {recipe && (
            <div className="space-y-6">
               {recipe.imageUrl && (
                <img 
                  src={recipe.imageUrl} 
                  alt={recipe.recipeName} 
                  className="w-full h-64 object-cover rounded-lg shadow-md mb-6" 
                />
              )}
              <p className="text-slate-600">{recipe.description}</p>
              
              <div className="flex flex-wrap gap-4 text-center border-t border-b py-4">
                  <div className="flex-1">
                      <div className="text-sm text-slate-500">{t('modal.prepTime')}</div>
                      <div className="font-semibold">{recipe.prepTime}</div>
                  </div>
                  <div className="flex-1">
                      <div className="text-sm text-slate-500">{t('modal.cookTime')}</div>
                      <div className="font-semibold">{recipe.cookTime}</div>
                  </div>
                  <div className="flex-1">
                      <div className="text-sm text-slate-500">{t('modal.servings')}</div>
                      <div className="font-semibold">{recipe.servings}</div>
                  </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-orange-600">{t('modal.ingredients')}</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 text-orange-600">{t('modal.instructions')}</h3>
                <ol className="list-decimal list-inside space-y-3 text-slate-700">
                  {recipe.steps.map((step, index) => <li key={index}>{step}</li>)}
                </ol>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {recipe.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-600 text-sm font-medium px-3 py-1 rounded-full">
                          #{tag}
                      </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};