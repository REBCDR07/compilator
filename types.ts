
export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  base64: string;
  mimeType: string;
  size: number;
  extractedText?: string; // For Word documents
}

export interface DocumentAnalysis {
  fileName: string;
  nomComplet: string; // Merged field for Nom & Prénom
  email: string;
  telephone: string;
  sujet: string;
  objectifs: string; // Will be labeled "Objectif général et spécifiques"
}

export interface CompilationResult {
  analyses: DocumentAnalysis[];
}
