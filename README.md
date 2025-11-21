# Extracteur de Données Documentaires (PDF & Word)

Cette application permet d'uploader plusieurs documents (PDF ou Word), d'extraire automatiquement les informations clés (Nom, Prénom, Email, Téléphone, Sujet, Objectifs) grâce à l'IA Gemini, et de générer un rapport PDF structuré avec un tableau par fichier.

## Fonctionnalités

- **Multi-formats** : Supporte les fichiers `.pdf` et `.docx`.
- **Extraction IA** : Utilise Google Gemini 2.5 Flash pour une extraction précise et structurée.
- **Rapport PDF** : Génère un fichier PDF téléchargeable contenant un tableau détaillé pour chaque document analysé.
- **Interface** : Drag & Drop, design épuré (Police Montserrat & Times New Roman).

## Prérequis pour le déploiement (Vercel)

Ce projet nécessite une clé API Google Gemini.

1. Obtenez une clé sur [Google AI Studio](https://aistudio.google.com/).
2. Dans les paramètres de votre projet Vercel, ajoutez une variable d'environnement :
   - **Nom** : `API_KEY`
   - **Valeur** : `Votre_Clé_API_Gemini`

## Installation locale

1. Clonez le dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine :
   ```env
   API_KEY=votre_cle_api_ici
   ```
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Technologies

- React (Vite)
- TypeScript
- Tailwind CSS
- Google GenAI SDK
- Mammoth.js (Extraction Word)
- jsPDF & AutoTable (Génération PDF)
