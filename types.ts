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
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  sujet: string;
  objectifs: string; // Renamed from 'autres' to capture specific objectives fully
}

export interface CompilationResult {
  analyses: DocumentAnalysis[];
}