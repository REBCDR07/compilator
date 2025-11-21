import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile, CompilationResult, DocumentAnalysis } from "../types";

// Initialize the Google GenAI client with the API key from environment variables
// Note: process.env.API_KEY is guaranteed to be available per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Extracts structured data from a document's text using the Gemini API.
 */
const extractDataWithGemini = async (text: string, fileName: string): Promise<DocumentAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following document text and extract the specific information requested in the schema.
      
      Document Name: ${fileName}
      
      Document Text:
      ${text.substring(0, 500000)}`, // Passing text to the model
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nomComplet: {
              type: Type.STRING,
              description: "The full name of the person mentioned in the document (e.g., in a CV or header)."
            },
            email: {
              type: Type.STRING,
              description: "The email address found in the document."
            },
            telephone: {
              type: Type.STRING,
              description: "The phone number found in the document."
            },
            sujet: {
              type: Type.STRING,
              description: "The subject or object of the document."
            },
            objectifs: {
              type: Type.STRING,
              description: "The general and specific objectives mentioned in the document."
            }
          },
          required: ["nomComplet", "email", "telephone", "sujet", "objectifs"],
          propertyOrdering: ["nomComplet", "email", "telephone", "sujet", "objectifs"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");

    return {
      fileName: fileName,
      nomComplet: data.nomComplet || "Non détecté",
      email: data.email || "Non mentionné",
      telephone: data.telephone || "Non mentionné",
      sujet: data.sujet || "Non spécifié",
      objectifs: data.objectifs || "Non spécifié"
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      fileName: fileName,
      nomComplet: "Erreur IA",
      email: "",
      telephone: "",
      sujet: "Erreur de traitement",
      objectifs: "Une erreur est survenue lors de l'analyse du document via Gemini."
    };
  }
};

export const compileDocuments = async (files: UploadedFile[]): Promise<CompilationResult> => {
  const analyses = await Promise.all(files.map(async (file) => {
    // Basic validation
    if (!file.extractedText || file.extractedText.trim().length === 0) {
      return {
        fileName: file.name,
        nomComplet: "Inconnu",
        email: "",
        telephone: "",
        sujet: "Contenu vide ou illisible",
        objectifs: "Le texte n'a pas pu être extrait (fichier vide ou illisible)."
      };
    }

    return extractDataWithGemini(file.extractedText, file.name);
  }));

  return { analyses };
};
