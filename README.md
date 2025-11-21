# Extracteur de Données Documentaires (Local)

Une application web sécurisée et rapide pour extraire automatiquement des données structurées à partir de documents PDF et Word, directement dans votre navigateur.

## Fonctionnalités

- **100% Local** : Aucune donnée ne quitte votre navigateur. Analyse instantanée sans clé API.
- **Multi-formats** : Support des fichiers `.pdf` et `.docx`.
- **Extraction Automatique** : Utilise des algorithmes de détection (Regex) pour trouver emails, téléphones, noms, etc.
- **Export PDF** : Génération automatique d'un rapport PDF contenant un tableau individuel pour chaque fichier.
- **Design** : Interface moderne avec support Drag & Drop, utilisant les polices Montserrat et Times New Roman.

## Déploiement sur Vercel

Ce projet est optimisé pour un déploiement gratuit sur Vercel.

1. Importez ce dépôt git dans Vercel.
2. Cliquez sur **Deploy**. 
3. C'est tout ! Aucune variable d'environnement n'est requise.

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
3. Lancez l'application :
   ```bash
   npm run dev
   ```

## Stack Technique

- **Frontend** : React, TypeScript, Vite
- **UI** : Tailwind CSS, Lucide React
- **Traitement de fichiers** : 
  - Mammoth.js (Word)
  - PDF.js (PDF)
- **Génération PDF** : jsPDF, jsPDF-AutoTable
