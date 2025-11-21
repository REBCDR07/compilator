import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile, CompilationResult } from "../types";

export const compileDocuments = async (files: UploadedFile[]): Promise<CompilationResult> => {
  try {
    // Initialisation sécurisée à l'intérieur de la fonction
    // Cela évite que l'application plante au démarrage (White Screen) si la clé n'est pas chargée
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("La clé API (API_KEY) est manquante. Vérifiez votre configuration Vercel ou .env.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Typage explicite 'any' pour éviter les conflits de types TS sur le tableau mixte
    const contentParts: any[] = files.map((file) => {
        if (file.extractedText) {
            // Send Word doc content as text with filename context
            return {
                text: `--- DEBUT DU FICHIER NOMMÉ: "${file.name}" (Type: Word/DOCX) ---\nCONTENU:\n${file.extractedText}\n--- FIN DU FICHIER "${file.name}" ---`
            };
        } else {
            // Send PDF as inline data
            return {
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.base64,
                },
            };
        }
    });

    const promptText = `
      TACHE : EXTRACTION DE DONNÉES STRUCTURÉES PAR FICHIER.
      
      INSTRUCTIONS :
      1. Tu vas recevoir plusieurs documents (PDF ou Word).
      2. Pour CHAQUE document individuel, tu dois extraire des champs spécifiques.
      3. NE FAIS PAS DE RÉSUMÉ GLOBAL. NE MÉLANGE PAS LES INFORMATIONS DES FICHIERS.
      4. Si une information (comme le Nom ou l'Email) est manquante dans un fichier, mets "Non mentionné".
      
      CHAMPS À EXTRAIRE POUR CHAQUE FICHIER :
      - Nom (Nom de famille identifié)
      - Prénom (Prénom identifié)
      - Email (Adresse électronique)
      - Numéro (Téléphone)
      - Sujet (Objet du document, Titre, ou Poste visé)
      - Objectifs (Liste TOUS les objectifs spécifiques, buts, missions, tâches ou exigences mentionnés dans le document. Sois EXHAUSTIF. Ne résume pas, copie l'intégralité des points importants trouvés).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [...contentParts, { text: promptText }] },
      config: {
        systemInstruction: "Tu es un assistant administratif de saisie de données rigoureux. Tu extrais les informations textuelles complètes sans les modifier.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analyses: {
              type: Type.ARRAY,
              description: "Liste des analyses pour chaque fichier fourni.",
              items: {
                type: Type.OBJECT,
                properties: {
                  fileName: { type: Type.STRING, description: "Le nom du fichier source analysé" },
                  nom: { type: Type.STRING, description: "Nom de famille" },
                  prenom: { type: Type.STRING, description: "Prénom" },
                  email: { type: Type.STRING, description: "Adresse email" },
                  telephone: { type: Type.STRING, description: "Numéro de téléphone" },
                  sujet: { type: Type.STRING, description: "Sujet ou objet principal du document" },
                  objectifs: { type: Type.STRING, description: "Objectifs spécifiques complets, missions ou détails exhaustifs" }
                },
                required: ["fileName", "nom", "prenom", "email", "telephone", "sujet", "objectifs"]
              }
            }
          },
          required: ["analyses"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Aucune réponse reçue de l'IA.");
    }

    return JSON.parse(responseText) as CompilationResult;
  } catch (error) {
    console.error("Erreur de compilation:", error);
    throw error;
  }
};