
import { UploadedFile, CompilationResult, DocumentAnalysis } from "../types";

// Moteur d'extraction locale robuste basé sur Regex
// Aucune IA, pas d'appel API, fonctionne hors ligne.
const extractDataLocally = (text: string, fileName: string): DocumentAnalysis => {
  
  // 1. Normalisation : on garde la structure
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const fullText = lines.join('\n'); 

  // Regex Patterns
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/;
  const subjectRegexLine = /^(?:Objet|Sujet|Concerne)\s*[:\-]?\s*(.+)/i;
  
  // Regex pour le NOM basé sur "Synthèse"
  // Ex: "Synthèse de Jean Dupont", "Synthèse : Jean Dupont", "Synthèse Jean Dupont"
  const syntheseRegex = /synthèse\s*(?:de|du|:|par)?\s*(.+)/i;

  // --- Extraction Métadonnées ---
  
  const emailMatch = fullText.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : "Non mentionné";

  const phoneMatch = fullText.match(phoneRegex);
  const telephone = phoneMatch ? phoneMatch[0] : "Non mentionné";

  let sujet = "Non spécifié";
  let sujetLineIndex = -1;

  // Recherche du sujet
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(subjectRegexLine);
    if (match) {
      sujet = match[1].trim();
      sujetLineIndex = i;
      break;
    }
  }

  // --- Extraction NOM COMPLET (Après "Synthèse") ---
  let nomComplet = "Non détecté";
  let nomLineIndex = -1;

  for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i];
      const match = line.match(syntheseRegex);
      if (match && match[1].trim().length > 0) {
          nomComplet = match[1].trim();
          nomLineIndex = i;
          break;
      }
  }

  // Fallback si pas de mot "Synthèse" : on prend le nom de fichier ou on cherche une ligne courte au début
  if (nomComplet === "Non détecté") {
      // Essai simple : première ligne qui n'est pas un email/tel/sujet et qui a des lettres
      for (let i = 0; i < Math.min(lines.length, 5); i++) {
          const line = lines[i];
          if (line.includes('@') || phoneRegex.test(line) || i === sujetLineIndex) continue;
          if (line.length > 3 && /[a-zA-Z]/.test(line)) {
               // On suppose que c'est le titre/nom si on n'a pas trouvé "Synthèse"
               // Mais l'utilisateur a demandé explicitement après "Synthèse".
               // On laisse "Non détecté" ou on met une valeur par défaut safe.
               break; 
          }
      }
  }


  // --- Extraction OBJECTIFS (Contenu Complet) ---
  // Stratégie : On prend TOUT le texte, et on filtre seulement ce qu'on a déjà identifié comme métadonnée.
  
  const contentLines = lines.filter((line, index) => {
      const l = line.trim();
      
      // On retire l'email et le téléphone s'ils sont sur une ligne isolée
      if (l.includes(email) && l.length < email.length + 10) return false;
      if (l.includes(telephone) && l.length < telephone.length + 10) return false;
      
      // On retire la ligne exacte du sujet
      if (index === sujetLineIndex) return false;

      // On retire la ligne du Nom (Synthèse ...)
      if (index === nomLineIndex) return false;

      // On retire les mots clés "CV" ou "Curriculum Vitae" s'ils sont isolés
      if (/^curriculum vitae$/i.test(l) || /^cv$/i.test(l)) return false;

      return true;
  });

  let objectifs = contentLines.join('\n');

  if (!objectifs || objectifs.length < 5) {
      objectifs = "Aucun contenu textuel significatif extrait.";
  }

  return {
    fileName,
    nomComplet,
    email,
    telephone,
    sujet,
    objectifs
  };
};

export const compileDocuments = async (files: UploadedFile[]): Promise<CompilationResult> => {
  // Simulation asynchrone pour l'UX
  await new Promise(resolve => setTimeout(resolve, 300));

  const analyses: DocumentAnalysis[] = files.map(file => {
      try {
          // Vérification de sécurité si le texte est vide
          if (!file.extractedText || file.extractedText.trim().length === 0) {
             return {
                 fileName: file.name,
                 nomComplet: "Inconnu",
                 email: "",
                 telephone: "",
                 sujet: "Contenu vide ou illisible",
                 objectifs: "Le texte n'a pas pu être extrait (fichier vide ou format image non supporté)."
             };
          }

          return extractDataLocally(file.extractedText, file.name);

      } catch (e) {
          console.error("Erreur d'analyse interne:", e);
          return {
              fileName: file.name,
              nomComplet: "Erreur",
              email: "",
              telephone: "",
              sujet: "Erreur de traitement",
              objectifs: "Une erreur technique est survenue lors de la lecture de ce fichier."
          };
      }
  });

  return { analyses };
};
