import { UploadedFile, CompilationResult, DocumentAnalysis } from "../types";

// Fonction utilitaire pour nettoyer le texte
const cleanText = (text: string): string => {
  if (!text) return "";
  return text.replace(/\s+/g, ' ').trim();
};

// Moteur d'extraction locale basé sur Regex
const extractDataLocally = (text: string, fileName: string): DocumentAnalysis => {
  const clean = cleanText(text);

  // 1. Extraction Email
  const emailMatch = clean.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  const email = emailMatch ? emailMatch[0] : "Non mentionné";

  // 2. Extraction Téléphone
  // Cherche formats: 06 12 34 56 78, +33 6..., 06.12..., 0612345678
  const phoneMatch = clean.match(/(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/);
  const telephone = phoneMatch ? phoneMatch[0] : "Non mentionné";

  // 3. Extraction Sujet / Objet
  // Cherche "Objet:" ou "Sujet:" suivi du texte jusqu'à la fin de la ligne ou un point
  const subjectMatch = text.match(/(?:Objet|Sujet)\s*[:\-]?\s*([^\n\r]+)/i);
  let sujet = subjectMatch ? subjectMatch[1].trim() : "";
  if (!sujet) {
      // Fallback : Essayer de prendre la première ligne significative
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 10 && !l.includes('@'));
      sujet = lines.length > 0 ? lines[0].substring(0, 60) + (lines[0].length > 60 ? "..." : "") : "Non détecté";
  }

  // 4. Extraction Nom / Prénom (Heuristique basique)
  let nom = "Non détecté";
  let prenom = "";
  
  // Essai d'extraction depuis l'email (souvent prenom.nom@...)
  if (email !== "Non mentionné") {
      const emailParts = email.split('@')[0].split(/[._-]/);
      if (emailParts.length >= 2) {
          prenom = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
          nom = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1);
      }
  }

  // 5. Objectifs Spécifiques (Extraction brute du contenu pertinent)
  // On extrait les blocs de texte qui semblent être du contenu (paragraphes)
  const lines = text.split('\n');
  const contentLines = lines.filter(line => {
      const l = line.trim();
      // On garde les lignes assez longues qui ne sont pas des métadonnées
      return l.length > 30 && !l.includes(email) && (!telephone || !l.includes(telephone));
  });
  
  // On prend un échantillon du contenu
  const objectifs = contentLines.length > 0 
      ? contentLines.slice(0, 15).join('\n\n').substring(0, 1000) // Limite à 15 paragraphes ou 1000 chars
      : "Aucun contenu textuel significatif trouvé pour l'analyse.";

  return {
    fileName,
    nom,
    prenom,
    email,
    telephone,
    sujet,
    objectifs
  };
};

export const compileDocuments = async (files: UploadedFile[]): Promise<CompilationResult> => {
  console.log("Début de l'analyse locale (Regex)...");
  
  // Simulation d'un délai pour l'expérience utilisateur
  await new Promise(resolve => setTimeout(resolve, 800));

  const analyses: DocumentAnalysis[] = files.map(file => {
      try {
          if (!file.extractedText || file.extractedText.trim().length === 0) {
              return {
                  fileName: file.name,
                  nom: "Erreur",
                  prenom: "",
                  email: "",
                  telephone: "",
                  sujet: "Lecture impossible",
                  objectifs: "Impossible d'extraire le texte de ce fichier (fichier image ou protégé ?)."
              };
          }
          return extractDataLocally(file.extractedText, file.name);
      } catch (e) {
          console.error("Erreur d'analyse locale sur", file.name, e);
          return {
              fileName: file.name,
              nom: "Erreur",
              prenom: "",
              email: "",
              telephone: "",
              sujet: "Erreur interne",
              objectifs: "Une erreur est survenue lors de l'analyse de ce fichier."
          };
      }
  });

  return { analyses };
};