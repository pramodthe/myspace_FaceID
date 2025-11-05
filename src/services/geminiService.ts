import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });

export const pixelateImageWithBackgroundRemoval = async (base64Image: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/png',
                data: base64Image.split(',')[1], // Remove the "data:image/png;base64," prefix
            },
        };

        const textPart = {
            text: "Your task is to convert a user's photo into a consistent 16-bit pixel art character portrait. Create a head-and-shoulders portrait, with the person looking forward as much as possible, even if the original photo is at an angle. Remove the background and replace it with solid white. The art style should be consistent for all images: detailed 16-bit pixel art, like a character portrait from a classic 90s Japanese RPG. Ensure clear outlines and a limited but intentional color palette. The final image must only be the pixelated character on the plain white background.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && 'inlineData' in firstPart) {
             return `data:image/png;base64,${firstPart.inlineData.data}`;
        } else {
            throw new Error("No image was returned from the API.");
        }
    } catch (error) {
        console.error("Error processing image with Gemini:", error);
        throw new Error("Failed to pixelate image.");
    }
};

