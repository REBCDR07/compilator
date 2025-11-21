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

  // --- Extraction NOM / PRÉNOM ---
  let nom = "Non détecté";
  let prenom = "";

  // On cherche dans les 10 premières lignes
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i];
      // On ignore les lignes techniques ou métadonnées pour le nom
      if (line.includes('@') || phoneRegex.test(line) || i === sujetLineIndex) continue;
      if (line.toLowerCase().includes('page')) continue;
      
      // Candidat probable : ligne courte avec des lettres
      if (line.length > 2 && line.length < 50 && /[a-zA-Z]/.test(line)) {
          const parts = line.split(/\s+/);
          if (parts.length >= 2) {
              prenom = parts[0];
              nom = parts.slice(1).join(' ');
              break;
          }
      }
  }

  // --- Extraction OBJECTIFS SPÉCIFIQUES (Contenu Complet) ---
  // Stratégie : On prend TOUT le texte, et on filtre seulement ce qu'on a déjà identifié comme métadonnée.
  // Cela évite de couper le début du texte si l'en-tête est mal formaté.

  const contentLines = lines.filter((line, index) => {
      const l = line.trim();
      
      // On retire l'email et le téléphone s'ils sont sur une ligne isolée
      if (l.includes(email) && l.length < email.length + 10) return false;
      if (l.includes(telephone) && l.length < telephone.length + 10) return false;
      
      // On retire la ligne exacte du sujet
      if (index === sujetLineIndex) return false;

      // On retire le nom/prénom s'il est sur une ligne isolée au début (index < 10)
      if (index < 10 && l.includes(nom) && l.includes(prenom)) return false;

      // On retire les mots clés "CV" ou "Curriculum Vitae" s'ils sont isolés
      if (/^curriculum vitae$/i.test(l) || /^cv$/i.test(l)) return false;

      return true;
  });

  let objectifs = contentLines.join('\n');

  if (!objectifs || objectifs.length < 5) {
      objectifs = "Aucun contenu textuel significatif extrait. Le document est peut-être une image.";
  }

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
  // Simulation asynchrone pour l'UX
  await new Promise(resolve => setTimeout(resolve, 300));

  const analyses: DocumentAnalysis[] = files.map(file => {
      try {
          // Vérification de sécurité si le texte est vide
          if (!file.extractedText || file.extractedText.trim().length === 0) {
             // Tentative de fallback : si c'est un nom de fichier parlant, on peut au moins mettre ça
             return {
                 fileName: file.name,
                 nom: "Inconnu",
                 prenom: "",
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
              nom: "Erreur",
              prenom: "",
              email: "",
              telephone: "",
              sujet: "Erreur de traitement",
              objectifs: "Une erreur technique est survenue lors de la lecture de ce fichier."
          };
      }
  });

  return { analyses };
};