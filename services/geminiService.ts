import OpenAI from 'openai';
import type { Recipe, SearchFilters } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL;

let openai: OpenAI | null = null;

// 验证 API key - 检查是否存在且不是占位符
const isValidApiKey = (key: string | undefined): boolean => {
    if (!key || key.trim() === '') return false;
    const placeholders = ['your_api_key_here', 'your-api-key', 'placeholder', 'xxx'];
    return !placeholders.some(placeholder => key.toLowerCase().includes(placeholder.toLowerCase()));
};

if (isValidApiKey(API_KEY)) {
    openai = new OpenAI({
        apiKey: API_KEY,
        baseURL: BASE_URL || 'https://ai.t8star.cn/v1',
        dangerouslyAllowBrowser: true
    });
}

const getOpenAI = () => {
    if (!openai) {
        throw new Error("GEMINI_API_KEY_MISSING");
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

        // Step 1: Generate Recipe JSON using GPT model
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
        if (error instanceof Error) {
            if (error.message.includes("JSON")) {
                throw new Error("error.invalidRecipeFormat");
            }
            throw error;
        }
        throw new Error("API_UNKNOWN_ERROR");
    }
};
