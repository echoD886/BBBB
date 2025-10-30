export interface Recipe {
  recipeName: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
  imageUrl: string;
}

export interface SearchFilters {
  preference?: string;
  difficulty?: string;
  diet?: string;
}