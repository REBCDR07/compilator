# Extracteur de Données Documentaires (PDF & Word)

Une application web alimentée par l'IA pour extraire automatiquement des données structurées à partir de documents PDF et Word.

## Fonctionnalités

- **Multi-formats** : Support des fichiers `.pdf` et `.docx`.
- **Extraction Intelligente** : Utilise Google Gemini 2.5 Flash pour analyser le contenu.
- **Champs Extraits** : Nom, Prénom, Email, Téléphone, Sujet, et une liste exhaustive des Objectifs Spécifiques.
- **Export PDF** : Génération automatique d'un rapport PDF contenant un tableau individuel pour chaque fichier.
- **Design** : Interface moderne avec support Drag & Drop, utilisant les polices Montserrat et Times New Roman.

## Déploiement sur Vercel

Ce projet est configuré pour être déployé facilement sur Vercel.

### Prérequis
1. Un compte [Google AI Studio](https://aistudio.google.com/) pour obtenir une clé API.
2. Un compte Vercel.

### Étapes
1. Importez ce dépôt git dans Vercel.
2. Dans la configuration du projet ("Environment Variables"), ajoutez :
   - **Key**: `API_KEY`
   - **Value**: Votre clé API Gemini (commençant par `AIza...`)
3. Déployez !

## Installation Locale

1. Clonez le dépôt :
   ```bash
   git clone <votre-repo>
   cd <votre-repo>
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine et ajoutez votre clé :
   ```env
   API_KEY=votre_cle_api_ici
   ```
4. Lancez l'application :
   ```bash
   npm run dev
   ```

## Stack Technique

- **Frontend** : React, TypeScript, Vite
- **UI** : Tailwind CSS, Lucide React
- **IA** : Google GenAI SDK (Gemini 2.5 Flash)
- **Traitement de fichiers** : Mammoth.js (Word), FileReader (PDF)
- **Génération PDF** : jsPDF, jsPDF-AutoTable
