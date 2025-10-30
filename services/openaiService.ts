import OpenAI, { APIError } from 'openai';
import type { Recipe, SearchFilters } from '../types';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

let openai: OpenAI | null = null;

if (API_KEY) {
    openai = new OpenAI({ 
        apiKey: API_KEY,
        dangerouslyAllowBrowser: true 
    });
}

const getOpenAI = () => {
    if (!openai) {
        throw new Error("VITE_OPENAI_API_KEY environment variable not set. Please configure your API key in .env.local");
    }
    return openai;
};

export const generateRecipe = async (ingredients: string, filters: SearchFilters, language: 'en' | 'zh'): Promise<Recipe> => {
    const recipePrompt = `
        Ingredients I have: ${ingredients}.
        My preferences:
        - Flavor: ${filters.preference || 'any'}
        - Difficulty: ${filters.difficulty || 'any'}
        - Dietary Goal: ${filters.diet || 'any'}

        Please generate a delicious recipe based on the information above.
        The entire recipe must be in ${language === 'zh' ? 'Chinese' : 'English'}.
        This includes the recipe name, description, ingredients, steps, and tags.
        
        Respond ONLY with a valid JSON object matching this exact structure:
        {
            "recipeName": "string",
            "description": "string",
            "prepTime": "string (e.g., '15 minutes')",
            "cookTime": "string (e.g., '30 minutes')",
            "servings": "string (e.g., '4 servings')",
            "ingredients": ["string", "string"],
            "steps": ["string", "string"],
            "tags": ["string", "string"]
        }
    `;

    try {
        const client = getOpenAI();
        
        // Step 1: Generate Recipe JSON using GPT-4
        const recipeResponse = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional chef. Generate creative and delicious recipes in valid JSON format only."
                },
                {
                    role: "user",
                    content: recipePrompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });
        
        const recipeText = recipeResponse.choices[0]?.message?.content;
        
        if (!recipeText) {
            throw new Error("Failed to generate recipe data: The model returned an empty response. Please try again.");
        }
        
        const recipe: Omit<Recipe, 'imageUrl'> = JSON.parse(recipeText);
        
        // Validate the recipe structure
        if (!recipe.recipeName || !recipe.description || !recipe.ingredients || !recipe.steps) {
            throw new Error("The AI returned an invalid recipe format. Please try generating again.");
        }

        // Step 2: Generate Recipe Image using DALL-E
        const imagePrompt = `A beautiful, realistic, appetizing photo of "${recipe.recipeName}". A professionally shot food photograph, perfectly lit, high resolution, food photography style.`;
        
        const imageResponse = await client.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
        });

        const base64Image = imageResponse.data[0]?.b64_json;

        if (!base64Image) {
            throw new Error("The recipe data was generated, but the image could not be created. Please try again.");
        }
        
        const imageUrl = `data:image/png;base64,${base64Image}`;

        return {
            ...recipe,
            imageUrl,
        };

    } catch (error) {
        console.error("Error in generateRecipe service:", error);

        const status = error instanceof APIError
            ? error.status
            : (typeof error === 'object' && error !== null && 'status' in error ? Number((error as { status?: number }).status) : undefined);

        if (status === 429) {
            throw new Error("API_QUOTA_EXCEEDED");
        }

        if (status === 401 || status === 403) {
            throw new Error("API_INVALID_KEY");
        }

        if (error instanceof Error) {
            if (error.message.includes("JSON")) {
                throw new Error("error.invalidRecipeFormat");
            }

            if (error.message.includes("you exceeded your current quota") || error.message.includes("rate limit")) {
                throw new Error("API_QUOTA_EXCEEDED");
            }

            throw error;
        }

        throw new Error("API_UNKNOWN_ERROR");
    }
};

