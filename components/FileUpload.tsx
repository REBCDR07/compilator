import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, FileType, X, AlertCircle } from 'lucide-react';
import { UploadedFile } from '../types';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configuration robuste du worker. Utilise une version fixe compatible.
// Cela évite les erreurs si pdfjsLib.version est undefined lors du build.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface FileUploadProps {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        // Chargement du document
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        // Extraction page par page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }
        return fullText;
    } catch (e) {
        console.error("Erreur PDF.js:", e);
        throw new Error("Impossible de lire le fichier PDF. Est-il corrompu ou protégé ?");
    }
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setError(null);
    const newFiles: UploadedFile[] = [];
    const filesArray = Array.from(fileList);
    
    for (const file of filesArray) {
      const lowerName = file.name.toLowerCase();
      const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
      const isWord = 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          lowerName.endsWith('.docx');

      if (!isPdf && !isWord) {
        setError(`Le fichier "${file.name}" n'est pas supporté. Utilisez PDF ou Word (.docx).`);
        continue;
      }

      try {
        let extractedText = "";
        let base64Data = ""; 

        if (isPdf) {
           extractedText = await extractTextFromPdf(file);
        } else if (isWord) {
           const arrayBuffer = await file.arrayBuffer();
           const result = await mammoth.extractRawText({ arrayBuffer });
           extractedText = result.value;
        }

        // Vérification basique
        if (!extractedText || extractedText.trim().length < 5) {
             console.warn(`Peu de texte extrait pour ${file.name}`);
        }

        newFiles.push({
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          size: file.size,
          mimeType: isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          base64: base64Data,
          extractedText: extractedText || ""
        });

      } catch (err: any) {
        console.error("Error processing file", file.name, err);
        setError(`Erreur sur ${file.name}: ${err.message || 'Lecture impossible'}`);
      }
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      await processFiles(event.target.files);
    }
    event.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const triggerFileInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer group
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className={`
            p-3 rounded-full transition-transform duration-300
            ${isDragActive ? 'bg-indigo-200 text-indigo-700 scale-110' : 'bg-indigo-100 text-indigo-600 group-hover:scale-110'}
          `}>
            <Upload size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragActive ? "Déposez les fichiers ici" : "Cliquez ou glissez vos fichiers"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF (.pdf) et Word (.docx) acceptés
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm animate-fadeIn">
          <AlertCircle size={16} className="mr-2 shrink-0" />
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm animate-fadeIn hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`p-2 rounded-lg shrink-0 ${file.mimeType === 'application/pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  {file.mimeType === 'application/pdf' ? <FileText size={20} /> : <FileType size={20} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Retirer le fichier"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;