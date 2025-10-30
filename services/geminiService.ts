import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe, SearchFilters } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    `;

    try {
        // Step 1: Generate Recipe JSON using a text model with a response schema
        const recipeResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: recipePrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recipeName: { type: Type.STRING, description: "Name of the recipe" },
                        description: { type: Type.STRING, description: "A short, enticing description of the dish." },
                        prepTime: { type: Type.STRING, description: "Preparation time, e.g., '15 minutes'" },
                        cookTime: { type: Type.STRING, description: "Cooking time, e.g., '30 minutes'" },
                        servings: { type: Type.STRING, description: "Number of servings, e.g., '4 servings'" },
                        ingredients: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "List of ingredients with measurements."
                        },
                        steps: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "Step-by-step instructions for preparation and cooking."
                        },
                        tags: { 
                            type: Type.ARRAY, 
                            items: { type: Type.STRING },
                            description: "Descriptive tags for the recipe, e.g., 'Quick', 'Healthy', 'Vegetarian'."
                        },
                    },
                    required: ["recipeName", "description", "prepTime", "cookTime", "servings", "ingredients", "steps", "tags"]
                },
            },
        });
        
        const candidate = recipeResponse.candidates?.[0];
        
        if (!candidate || !recipeResponse.text) {
             const finishReason = candidate?.finishReason;
             console.error(`Recipe text generation failed or was blocked. Finish reason: ${finishReason}`);
             if (finishReason === 'SAFETY') {
                 throw new Error("The recipe could not be generated due to safety settings. Please try different ingredients.");
             }
             throw new Error("Failed to generate recipe data: The model returned an empty response. Please try again.");
        }
        
        const recipe: Omit<Recipe, 'imageUrl'> = JSON.parse(recipeResponse.text);

        // Step 2: Generate Recipe Image using an image model
        const imagePrompt = `A beautiful, realistic, appetizing photo of "${recipe.recipeName}". A professionally shot food photograph, perfectly lit, high resolution.`;
        
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        });

        const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;

        if (!base64ImageBytes) {
            throw new Error("The recipe data was generated, but the image could not be created. Please try again.");
        }
        
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

        return {
            ...recipe,
            imageUrl,
        };

    } catch (error) {
        console.error("Error in generateRecipe service:", error);
        if (error instanceof Error) {
            if (error.message.includes("JSON")) {
                 throw new Error("The AI returned an invalid recipe format. Please try generating again.");
            }
            throw error;
        }
        throw new Error("An unknown error occurred during recipe generation.");
    }
};